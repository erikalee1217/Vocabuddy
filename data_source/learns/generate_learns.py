import pickle
import csv
import random
from datetime import datetime, timedelta
import names
import pickle

def generate_joined_time():
    """Generate a random timestamp within the last year."""
    now = datetime.now()
    days_back = random.randint(1, 365)
    random_date = now - timedelta(days=days_back)
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

def generate_learns(pkl_filename, out_filename, num_lines=10000):
    # Assuming 'my_list.pkl' is the file where you have pickled (saved) your list
    with open(pkl_filename, 'rb') as file:
        all_emails = pickle.load(file)
    
    headers = ['Email', 'TestId', 'WordId', 'LastLearnedTime', 'PercentLearned']
    
    # Email VARCHAR(255),
    # TestId INT,
    # WordId INT,
    # LastLearnedTime TIMESTAMP NOT NULL,
    # PercentLearned INT NOT NULL,

    rows = []
    for i in range(1, num_lines):
        email = random.choice(all_emails)
        rows.append({
            'Email': email,
            'TestId': random.choice([0, 3]),
            'WordId': random.randint(0, 954),
            'LastLearnedTime': generate_joined_time(),
            'PercentLearned': random.randint(0, 100)
        })

    with open(out_filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
        
generate_learns("/Users/ziheng/UIUC Courses/SP24/CS411-Vocabuddy/data_source/users/all_emails.pkl", "fake_learns.csv")