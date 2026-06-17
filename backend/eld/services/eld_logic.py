from math import floor

def generate_eld_logs(distance_km, duration_hours=None, pickup_hours=1.0, dropoff_hours=1.0,
                      avg_speed_kmph=85.0, current_cycle_used_hours=0.0):
    """Generate simple ELD daily logs given a trip distance.

    Returns list of days; each day is dict {day_index, segments:[{status,start_hour,duration}],
    cycle_hours_after_day, cycle_violation}
    """
    # estimate duration if not provided
    if duration_hours is None or duration_hours <= 0:
        duration_hours = distance_km / avg_speed_kmph if avg_speed_kmph > 0 else 0

    # fueling stops every 1000 miles (~1609 km)
    distance_miles = distance_km / 1.609
    fueling_stops = int(distance_miles // 1000)
    fueling_hours = fueling_stops * 0.5

    remaining_drive = duration_hours
    remaining_non_drive = pickup_hours + dropoff_hours + fueling_hours

    max_daily_drive = 11.0  # property-carrying driving limit
    days = []
    day_index = 1
    cumulative_cycle = current_cycle_used_hours

    while remaining_drive > 0 or remaining_non_drive > 0:
        segments = []
        day_used = 0.0

        # On first day, include pickup first if present
        if day_index == 1 and pickup_hours > 0 and remaining_non_drive > 0:
            dur = min(remaining_non_drive, pickup_hours)
            segments.append({'status': 'ON_DUTY_PICKUP', 'start_hour': day_used, 'duration': round(dur,2)})
            day_used += dur
            remaining_non_drive = max(0.0, remaining_non_drive - dur)

        # Driving segment
        drive_today = min(remaining_drive, max_daily_drive)
        if drive_today > 0:
            segments.append({'status': 'DRIVING', 'start_hour': day_used, 'duration': round(drive_today,2)})
            day_used += drive_today
            remaining_drive = max(0.0, remaining_drive - drive_today)

        # Add some non-driving on-duty tasks (fueling/dropoff)
        if remaining_non_drive > 0:
            dur = min(remaining_non_drive, 2.0)  # spread non-driving across days
            segments.append({'status': 'ON_DUTY', 'start_hour': day_used, 'duration': round(dur,2)})
            day_used += dur
            remaining_non_drive = max(0.0, remaining_non_drive - dur)

        # If trip complete and dropoff remains, include
        if remaining_drive == 0 and remaining_non_drive > 0 and dropoff_hours > 0:
            dur = min(remaining_non_drive, dropoff_hours)
            segments.append({'status': 'ON_DUTY_DROPOFF', 'start_hour': day_used, 'duration': round(dur,2)})
            day_used += dur
            remaining_non_drive = max(0.0, remaining_non_drive - dur)

        # Fill remaining day as OFF_DUTY (rest)
        if day_used < 24.0:
            off = round(24.0 - day_used, 2)
            segments.append({'status': 'OFF_DUTY', 'start_hour': round(day_used,2), 'duration': off})
            day_used += off

        # update cycle hours: driving + on-duty counts towards cycle
        work_hours = sum(s['duration'] for s in segments if s['status'] in ('DRIVING','ON_DUTY','ON_DUTY_PICKUP','ON_DUTY_DROPOFF'))
        cumulative_cycle += work_hours
        cycle_violation = cumulative_cycle > 70.0

        days.append({
            'day_index': day_index,
            'segments': segments,
            'cycle_hours_after_day': round(cumulative_cycle,2),
            'cycle_violation': cycle_violation,
        })

        day_index += 1

        # Safety: avoid infinite loops
        if day_index > 30:
            break

    return days
