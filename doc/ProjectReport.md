# Project Report

### Project Name: Vocabuddy

### Introduction
Our project, Vocabuddy, is a dedicated web-based application designed for learners preparing for standardized tests such as the TOEFL and GRE. It provides a convenient platform for vocabulary learning directly through browsers, eliminating the need for cumbersome app downloads. Despite updates to our database design and functional enhancements, the foundational mission of Vocabuddy—to facilitate accessible and effective vocabulary preparation—has remained consistent from start to finish.

We offer several features on Vocabuddy. Users can search for words, track their learning progress, and connect with friends to view each other’s progress and target schools, creating a spirit of positive competition. Our vocabulary database primarily includes words from the TOEFL and GRE. Users can learn the word's stem, part of speech, meaning, and an example sentence of each word that they might encounter in tests. We also created a clear and user-friendly interface that helps users to achieve effective vocabulary learning in an optimal environment.


### Project Direction Changes
The transition from the original proposal of Vocabuddy to the final project includes several parts. First, we initially planned to support ACT, SAT, and GRE; however, the focus was narrowed to GRE and TOEFL due to available data. Then, the proposed envisioned features such as interactive exercises, quizzes, and a sophisticated recommendation system were simplified. Instead, the final project featured basic functionalities like word search, progress tracking, and social connectivity, with study recommendations based primarily on learning progress rather than complex analysis such as the categorization or similarity of words.

Data sourcing shifted from an intended reliance on Quizlet to using a processed Kaggle dataset supplemented by Quizlet and Magoosh. The reduction in team size also influenced the project's scope, leading to a more straightforward and user-friendly application that prioritized reliability and ease of use rather than extensive interactivity and personalization. This strategic shift ensured the project remained effective in its core mission of enhancing vocabulary preparation for standardized tests.


### Data Schema Modifications
Initially, our database schema had nine tables: User, IsFriendWith, School, Education, Progress, Learns, Stems, Words, and Meaning. After reviewing, we found redundancies; for example, the Education table had duplication issues due to identical primary keys with another table. We then integrated some tables and revised key assignments. Finally, we came up with a streamlined schema with seven tables: User, IsFriendWith, School, Tests, Learns, Words, and Meaning. This redesign reduced redundancy and improved data integrity.


### Application Effectiveness
Vocabuddy shows significant effectiveness in providing an accessible and user-friendly platform for vocabulary learning. It successfully offers learners a convenient web-based environment that removes the need for cumbersome app downloads. It is particularly useful for those preparing for the TOEFL and GRE tests. Features such as word search, progress tracking, and social connectivity can significantly foster a collaborative and competitive learning atmosphere, enhancing motivation and engagement. However, the application still has some limitations. For example, in our initial version, the platform aimed to pursue a highly interactive and personalized learning experience. Some advanced functionalities, such as a recommendation system based on individual study patterns, were lacking due to time constraints and the complexity of implementation. As a result, the project excels at basic vocabulary learning but fails in offering a deeper, customized learning experience that was initially envisioned.


### Advanced Database Programs Integration
#### Post-Demo Developments
Since our Checkpoint 2 demo, we have implemented significant enhancements to our database’s advanced programming features to address feedback (e.g., lack of advanced queries, isolation level setting). Specifically, we refined our transaction, triggers, and stored procedures.

#### Transactions
The user creation functionality uses transactions to enhance reliability. With REPEATABLE READ isolation level, the transaction ensures data integrity and consistency throughout the user creation process. If any part fails, the entire operation is rolled back, preventing inconsistencies.

#### Triggers
We have implemented a trigger that activates when a new learning session record is created. This trigger checks if the 'PercentLearned' of the new record exceeds 50%. If it does, the 'LastActiveTime' in the 'IsFriendWith' table is updated, reflecting the user's recent engagement in meaningful learning. This automation ensures that the application only updates last active statuses for sessions where substantial learning progress is made, which helps in maintaining an accurate and motivating user profile display.

#### Stored Procedures
We use a stored procedure to streamline data retrieval processes. This procedure is specifically designed to fetch a comprehensive view of data related to a specific user, identified by their email address. By consolidating complex queries within this stored procedure, we reduce the processing load on our application servers and improve response times for users, making the user experience smoother and more efficient.

#### Constraints
The constraints are critical for ensuring data integrity and improving application performance. Primary keys, foreign keys, and unique constraints across tables like Words, User, and School prevent duplicate entries and support efficient data retrieval. These constraints facilitate reliable relationships between data points, enhancing features such as user progress tracking and social connectivity, which leads to a more organized experience.


### Technical Challenges
In developing the frontend part, we encountered challenges such as handling repetitive elements in API responses. This was addressed by adjusting the backend to ensure that only unique results were sent to the frontend. Additionally, there was an issue where words with multiple meanings were not displayed correctly on the details page. This was resolved by modifying the URL structure to better accommodate multiple entries. To enhance this project for a potential web app release, it would benefit from a responsive design to ensure usability across various devices and a consistent component style to improve the user interface. Additionally, integrating a third-party authentication service like Firebase could simplify user access and enhance security.

As for the technical challenges regarding backend development, the initial struggle we encountered was that we couldn’t test our API endpoints code efficiently. Additionally, some functions such as insert or modify data couldn’t be tested without a platform that can simulate client-server interactions and visualize API responses. Then we found the Postman API platform to be a very useful tool. Postman allows us to efficiently verify the effectiveness of our endpoint code through its user-friendly interface and clear operation. Therefore, we highly recommend Postman to anyone involved in web app backend development as an essential tool for enhancing workflow and code accuracy.

Other challenges include dealing with complex functionalities and deployments. For instance, designing the implementation of functionality required thorough consideration of the overall workflow, the sequence of operations, and error control, which can sometimes be extremely confusing. Another challenge arose when deploying to the Google Cloud Platform (GCP); the application often failed to execute due to a high workload paired with insufficient resources. The CPU and memory allocations in our initial virtual machine settings were inadequate for our needs. To address this issue, we upgraded our virtual machine from an e2-micro to an e2-medium, significantly increasing our resources. After this adjustment, the application began to perform effectively.


### Teamwork and Labor Division
At the beginning, there were four team members in our project. We discussed the project concept, project goal, and database design together. However, later one member dropped this class and we had three members left. In our current setup, ZiHeng (Jack) is responsible for the frontend development, and I-Hsuan (Erika) and Yen (Joanne) are working on the backend side. Frontend implementation has become more challenging with a reduced team, so we are collaborating closely to ensure that both ends of our application meet our goals.


### Future Improvements
For further improvements, we would like to implement personalized vocabulary recommendations through advanced search algorithms that would tailor content based on users' study history. This feature could ensure learners focus on the most relevant and crucial words for their tests. If we have more time and computing resources in the future, we would integrate this feature, making this application much more personalized and customized for users.
