import csv
import random
from datetime import datetime, timedelta
import names
import pickle

all_emails = []

def generate_random_string(length=10):
    """Generate a random string of fixed length."""
    letters = [str(i) for i in range(10)]
    return ''.join(random.choice(letters) for i in range(length))

def generate_joined_time():
    """Generate a random timestamp within the last year."""
    now = datetime.now()
    days_back = random.randint(1, 365)
    random_date = now - timedelta(days=days_back)
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

def generate_target_school_id():
    """Generate a TargetSchoolId favoring smaller numbers."""
    # Use the exponential distribution to favor smaller numbers
    scale = 10  # Adjust the scale to change the distribution
    random_number = int(random.expovariate(1 / scale))
    # Ensure the number falls within the desired range
    return max(1, min(random_number, 100))

def generate_csv_file(filename='fake_users.csv', num_lines=100):
    headers = ['Email', 'Password', 'FirebaseUID', 'Username', 'FirstName', 'LastName', 'JoinedTime', 'TargetSchoolId']
    
    rows = []
    for i in range(1, num_lines):
        first_name = names.get_first_name()
        last_name = names.get_last_name()
        username = f"{first_name.lower()}{last_name.lower()}"
        rows.append({
            'Email': f'{username}{i-1}@example.com',
            'Password': generate_random_string(12),
            'FirebaseUID': None,
            'Username': username,
            'FirstName': first_name,
            'LastName': last_name,
            'JoinedTime': generate_joined_time(),
            'TargetSchoolId': generate_target_school_id()
        })
        all_emails.append(f'{username}{i-1}@example.com')

    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    print(f'CSV file "{filename}" has been generated.')


def generate_friends(filename='fake_friends.csv', num_lines=100):
    generated = set()
    
    headers = ['Email', 'FriendEmail']
    
    rows = []
    i = 0
    while i < num_lines:
        email1 = random.choice(all_emails)
        email2 = random.choice(all_emails)

        if email1 != email2 and (email1, email2) not in generated and (email2, email1) not in generated:
            rows.append({
                'Email': f'{email1}',
                'FriendEmail': f'{email2}',
            })
            rows.append({
                'Email': f'{email2}',
                'FriendEmail': f'{email1}',
            })
            generated.add((email1, email2))
            generated.add((email2, email1))

            i += 1

    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    print(f'CSV file "{filename}" has been generated.')


# Call the function to generate the CSV file
generate_csv_file(num_lines=300)
generate_friends(num_lines=300)

with open('all_emails.pkl', 'wb') as file:
    pickle.dump(all_emails, file)

