import csv
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# Ensure necessary NLTK data is downloaded (you might have already done this)
# nltk.download('punkt')

# Initialize the stemmer
stemmer = PorterStemmer()

input_file_name = 'magoosh_1000_raw.csv'
words_file_name = 'magoosh_gre_words.csv'
meaning_file_name = 'magoosh_gre_meanings.csv'

count = 0

word_to_index = {}

with open(input_file_name, mode='r', encoding='utf-8') as infile, \
     open(words_file_name, mode='w', encoding='utf-8', newline='') as wordsfile, \
     open(meaning_file_name, mode='w', encoding='utf-8', newline='') as meaningsfile:
    
    reader = csv.DictReader(infile)
    words_writer = csv.DictWriter(wordsfile, fieldnames=['WordId', 'Word', 'TestId', 'Stem'])
    words_writer.writeheader()

    meanings_writer = csv.DictWriter(meaningsfile, fieldnames=['WordId', 'TestId', 'PartOfSpeech', 'Description', 'Example', 'Source'])
    meanings_writer.writeheader()
    
    for row in reader:
        # Check if any part of the input is empty
        if not all(row.values()):
            continue  # Skip this line
        
        word = row['word']
        pos = row['part of speech']
        definition = row['definition']
        example = row['example']

        if word not in word_to_index:
            word_to_index[word] = count

            # Stemming might require tokenizing if you're dealing with phrases or handling special cases
            stemmed_word = stemmer.stem(word)
            words_writer.writerow({'WordId': count, 'Word': word, 'TestId': 0, 'Stem': stemmed_word})
            count += 1
        
        meanings_writer.writerow({'WordId': word_to_index[word], 'TestId': 0, 'PartOfSpeech': pos, 'Description': definition, 'Example': example, 'Source': "Magoosh"})


print(f'Processed data has been saved')
