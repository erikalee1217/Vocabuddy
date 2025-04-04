import csv

# Define the input and output file names
input_file_name = '2024_QS_ranking_raw.csv'
output_file_name = '2024_QS_ranking.csv'
count = 0

# Function to clean and process the ranking
def process_ranking(rank):
    # Remove '=' if it's at the beginning
    if rank.startswith('='):
        rank = rank[1:]
    # If the rank is a range like '901-950', split on '-' and take the first part
    if '-' in rank:
        rank = rank.split('-')[0]
    return rank

def process_ranking(rank):
    if rank.startswith('='):
        rank = rank[1:]
    if '-' in rank:
        rank = rank.split('-')[0]
    if '+' in rank:
        rank = rank.split('+')[0]
    return rank

with open(input_file_name, mode='r', encoding='UTF-8', errors="replace") as infile:
    reader = csv.DictReader(infile)
    extracted_data = []

    for row in reader:
        try:
            school_name = row['Institution Name']
            school_rank_2024 = process_ranking(row['RANK'])
            country = row['Location']
            size = row['SIZE']
            # Ensure the overall score is processed correctly
            try:
                overall_score = round(float(row['SCORE']))
            except:
                overall_score = '-'
            # if country == 'United States':
            extracted_data.append([count, school_name, school_rank_2024, country, size, overall_score])

            count += 1
        except ValueError as e:
            print(f"Error processing row: {row}. Error: {e}")

with open(output_file_name, mode='w', encoding='utf-8', newline='') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(['SchoolId', 'SchoolName', 'SchoolRank', 'Country', 'Size', 'Score'])
    writer.writerows(extracted_data)

print(f'Data extracted and saved to {output_file_name}')

