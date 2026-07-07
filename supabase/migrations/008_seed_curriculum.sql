-- Migration 008: Seed Curriculums
DO $$
DECLARE
  v_user_id UUID;
  v_ml_topic_id UUID;
  v_web_topic_id UUID;
  v_dsa_topic_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users';
  END IF;

  -- =========================================================================
  -- MACHINE LEARNING (Krish Naik Bootcamp)
  -- =========================================================================

  -- 1. Python & Libraries
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '1. Python & Libraries', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Python Basics (Loops, Functions, OOPs)'),
  (v_ml_topic_id, 'NumPy (Arrays, Mathematics)'),
  (v_ml_topic_id, 'Pandas (DataFrames, GroupBy, Merging)'),
  (v_ml_topic_id, 'Matplotlib & Seaborn (Visualizations)');

  -- 2. Statistics for Data Science
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '2. Statistics for Data Science', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Descriptive Statistics (Mean, Median, Mode, Variance)'),
  (v_ml_topic_id, 'Probability Distributions (Normal, Log Normal, Binomial)'),
  (v_ml_topic_id, 'Central Limit Theorem'),
  (v_ml_topic_id, 'Inferential Statistics & Hypothesis Testing (Z-test, T-test, Chi-Square, ANOVA)'),
  (v_ml_topic_id, 'Covariance & Correlation (Pearson, Spearman)');

  -- 3. EDA & Feature Engineering
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '3. EDA & Feature Engineering', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Handling Missing Values (Imputation techniques)'),
  (v_ml_topic_id, 'Handling Outliers (Z-score, IQR)'),
  (v_ml_topic_id, 'Feature Scaling (Standardization vs Normalization)'),
  (v_ml_topic_id, 'Categorical Encoding (OHE, Label, Target Encoding)'),
  (v_ml_topic_id, 'Feature Selection Techniques');

  -- 4. Machine Learning - Regression
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '4. ML - Regression', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Simple & Multiple Linear Regression'),
  (v_ml_topic_id, 'Polynomial Regression'),
  (v_ml_topic_id, 'Ridge, Lasso & ElasticNet (Regularization)'),
  (v_ml_topic_id, 'Cost Function & Gradient Descent Math'),
  (v_ml_topic_id, 'Performance Metrics (R2, Adjusted R2, MSE, RMSE, MAE)');

  -- 5. Machine Learning - Classification
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '5. ML - Classification', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Logistic Regression'),
  (v_ml_topic_id, 'Decision Trees (Entropy, Gini Impurity, Information Gain)'),
  (v_ml_topic_id, 'Support Vector Machines (SVM) & Kernels'),
  (v_ml_topic_id, 'Naive Bayes (Gaussian, Multinomial)'),
  (v_ml_topic_id, 'K-Nearest Neighbors (KNN)'),
  (v_ml_topic_id, 'Performance Metrics (Confusion Matrix, Precision, Recall, F1, ROC-AUC)');

  -- 6. Machine Learning - Ensemble & Boosting
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '6. ML - Ensemble & Boosting', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Bagging & Random Forest'),
  (v_ml_topic_id, 'AdaBoost'),
  (v_ml_topic_id, 'Gradient Boosting'),
  (v_ml_topic_id, 'XGBoost (Extreme Gradient Boosting)');

  -- 7. Machine Learning - Unsupervised
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '7. ML - Unsupervised', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'K-Means Clustering (Elbow method, Silhouette score)'),
  (v_ml_topic_id, 'Hierarchical Clustering (Dendrograms)'),
  (v_ml_topic_id, 'DBSCAN'),
  (v_ml_topic_id, 'Principal Component Analysis (PCA) for Dimensionality Reduction');

  -- 8. Deep Learning - ANNs
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '8. DL - ANNs & Fundamentals', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Perceptrons & Multi-Layer Perceptrons'),
  (v_ml_topic_id, 'Forward & Backward Propagation'),
  (v_ml_topic_id, 'Activation Functions (Sigmoid, ReLU, Tanh, Softmax)'),
  (v_ml_topic_id, 'Optimizers (SGD, Adam, RMSprop) & Loss Functions'),
  (v_ml_topic_id, 'Overfitting (Dropout, Batch Normalization)');

  -- 9. Deep Learning - CNNs & Computer Vision
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '9. DL - CNNs & Computer Vision', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Convolution Operations, Pooling, Flattening'),
  (v_ml_topic_id, 'CNN Architectures (LeNet, AlexNet, VGG16, ResNet)'),
  (v_ml_topic_id, 'Transfer Learning'),
  (v_ml_topic_id, 'Object Detection (YOLO, SSD) Basics');

  -- 10. Deep Learning - RNNs & NLP
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '10. DL - Sequence Models & NLP', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Text Preprocessing (Stemming, Lemmatization, Stopwords)'),
  (v_ml_topic_id, 'Bag of Words, TF-IDF, Word2Vec, Embedding Layers'),
  (v_ml_topic_id, 'Recurrent Neural Networks (RNN) & Vanishing Gradient'),
  (v_ml_topic_id, 'LSTM & GRU Architectures'),
  (v_ml_topic_id, 'Transformers & BERT (Overview)');

  -- 11. Model Deployment & MLOps
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'ml', '11. Model Deployment & MLOps', 'Krish Naik') RETURNING id INTO v_ml_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_ml_topic_id, 'Pickling Models (Pickle, Joblib)'),
  (v_ml_topic_id, 'Building APIs with Flask/FastAPI'),
  (v_ml_topic_id, 'Dockerizing ML Apps'),
  (v_ml_topic_id, 'Cloud Deployment (AWS EC2 / Azure)'),
  (v_ml_topic_id, 'CI/CD Pipelines for ML (Github Actions)');


  -- =========================================================================
  -- WEB DEVELOPMENT (Apna College Delta)
  -- =========================================================================

  -- 1. Frontend Fundamentals
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '1. Frontend Fundamentals', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'HTML5 Tags, Semantic Web, Forms'),
  (v_web_topic_id, 'CSS3 Selectors, Box Model, Colors, Typography'),
  (v_web_topic_id, 'CSS Flexbox & CSS Grid'),
  (v_web_topic_id, 'Responsive Design & Media Queries'),
  (v_web_topic_id, 'CSS Frameworks (Bootstrap, Tailwind CSS basics)');

  -- 2. JavaScript Core
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '2. JavaScript Core', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'Variables, Data Types, Operators, Loops'),
  (v_web_topic_id, 'Functions, Arrow Functions, Scope & Hoisting'),
  (v_web_topic_id, 'Arrays & Objects (Map, Filter, Reduce)'),
  (v_web_topic_id, 'DOM Manipulation (Selecting, Styling, Creating Elements)'),
  (v_web_topic_id, 'Event Listeners, Event Bubbling & Delegation');

  -- 3. Advanced JavaScript
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '3. Advanced JavaScript', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'Asynchronous JS (Callbacks, Callback Hell)'),
  (v_web_topic_id, 'Promises & Error Handling'),
  (v_web_topic_id, 'Async/Await syntax'),
  (v_web_topic_id, 'APIs, JSON, and Fetch API / Axios'),
  (v_web_topic_id, 'Object Oriented JS (Classes, Prototypes, ''this'')');

  -- 4. React.js
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '4. React.js', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'React Basics, JSX, Virtual DOM'),
  (v_web_topic_id, 'Functional Components, Props, Lists & Keys'),
  (v_web_topic_id, 'State Management (useState) & Handling Events'),
  (v_web_topic_id, 'Component Lifecycle & useEffect Hook'),
  (v_web_topic_id, 'Forms in React & Controlled Components'),
  (v_web_topic_id, 'React Router (Navigation, Route params)'),
  (v_web_topic_id, 'State Management with Redux Toolkit / Context API');

  -- 5. Node.js & Express
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '5. Node.js & Express', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'Node.js Runtime, Global Object, modules (require/exports)'),
  (v_web_topic_id, 'NPM, package.json, installing dependencies'),
  (v_web_topic_id, 'Express.js Basics (Server, Ports, Request/Response)'),
  (v_web_topic_id, 'Routing, Path Parameters, Query Strings'),
  (v_web_topic_id, 'REST API Architecture & Postman'),
  (v_web_topic_id, 'Middlewares & Error Handling'),
  (v_web_topic_id, 'EJS Templating & Serving Static Files');

  -- 6. Databases (MongoDB)
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '6. Databases (MongoDB)', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'SQL vs NoSQL overview'),
  (v_web_topic_id, 'MongoDB CRUD Operations (Mongo Shell)'),
  (v_web_topic_id, 'Connecting Node to MongoDB using Mongoose'),
  (v_web_topic_id, 'Mongoose Schemas, Models, and Validations'),
  (v_web_topic_id, 'Database Relationships (One-to-One, One-to-Many, Many-to-Many)'),
  (v_web_topic_id, 'Populating Data in Mongoose');

  -- 7. Advanced Backend & Authentication
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '7. Advanced Backend & Auth', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'Stateful vs Stateless Authentication'),
  (v_web_topic_id, 'Cookies, Express-Session, Flash Messages'),
  (v_web_topic_id, 'Authentication with Passport.js / JWT'),
  (v_web_topic_id, 'Password Hashing (Bcrypt)'),
  (v_web_topic_id, 'Authorization & Protecting Routes'),
  (v_web_topic_id, 'Handling File Uploads (Multer, Cloudinary)'),
  (v_web_topic_id, 'MapBox API Integration (Geocoding & Maps)');

  -- 8. Deployment
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'web-dev', '8. Deployment', 'Apna College') RETURNING id INTO v_web_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_web_topic_id, 'Git Basics (Commit, Push, Pull, Branching)'),
  (v_web_topic_id, 'GitHub Repositories'),
  (v_web_topic_id, 'Environment Variables (.env)'),
  (v_web_topic_id, 'Deploying Database to MongoDB Atlas'),
  (v_web_topic_id, 'Deploying Full Stack App to Render/Vercel');


  -- =========================================================================
  -- DATA STRUCTURES & ALGORITHMS (Striver A2Z)
  -- =========================================================================

  -- 1. Basics & Math
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '1. Basics, Math & Patterns', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Star Patterns (Logic Building)'),
  (v_dsa_topic_id, 'Basic Math (Count Digits, Reverse Number, Palindrome, GCD/HCF)'),
  (v_dsa_topic_id, 'Basic Recursion (Print N to 1, Factorial, Fibonacci)'),
  (v_dsa_topic_id, 'Basic Hashing (Count frequency of elements)'),
  (v_dsa_topic_id, 'Time & Space Complexity Analysis');

  -- 2. Sorting
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '2. Sorting Algorithms', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Selection Sort, Bubble Sort, Insertion Sort'),
  (v_dsa_topic_id, 'Merge Sort'),
  (v_dsa_topic_id, 'Recursive Bubble Sort & Insertion Sort'),
  (v_dsa_topic_id, 'Quick Sort');

  -- 3. Arrays - Easy
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '3. Arrays - Easy Problems', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Largest & Second Largest Element'),
  (v_dsa_topic_id, 'Check if array is sorted and rotated'),
  (v_dsa_topic_id, 'Remove Duplicates from Sorted Array'),
  (v_dsa_topic_id, 'Left/Right Rotate array by K places'),
  (v_dsa_topic_id, 'Move Zeros to End'),
  (v_dsa_topic_id, 'Find missing number in array'),
  (v_dsa_topic_id, 'Max Consecutive Ones'),
  (v_dsa_topic_id, 'Find number that appears once, others twice');

  -- 4. Arrays - Medium
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '4. Arrays - Medium Patterns', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, '2Sum Problem (Hashing / Two Pointers)'),
  (v_dsa_topic_id, 'Sort an array of 0s, 1s, and 2s (Dutch National Flag)'),
  (v_dsa_topic_id, 'Majority Element (>N/2 times)'),
  (v_dsa_topic_id, 'Maximum Subarray Sum (Kadane''s Algorithm)'),
  (v_dsa_topic_id, 'Best Time to Buy and Sell Stock'),
  (v_dsa_topic_id, 'Rearrange elements by sign'),
  (v_dsa_topic_id, 'Next Permutation'),
  (v_dsa_topic_id, 'Leaders in an Array'),
  (v_dsa_topic_id, 'Longest Consecutive Sequence (Hashing)'),
  (v_dsa_topic_id, 'Set Matrix Zeroes'),
  (v_dsa_topic_id, 'Rotate Matrix by 90 degrees'),
  (v_dsa_topic_id, 'Spiral Traversal of Matrix');

  -- 5. Arrays - Hard
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '5. Arrays - Hard Patterns', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Pascal''s Triangle'),
  (v_dsa_topic_id, 'Majority Element (>N/3 times)'),
  (v_dsa_topic_id, '3Sum Problem'),
  (v_dsa_topic_id, '4Sum Problem'),
  (v_dsa_topic_id, 'Largest Subarray with 0 Sum'),
  (v_dsa_topic_id, 'Count Subarrays with given XOR'),
  (v_dsa_topic_id, 'Merge Overlapping Sub-intervals'),
  (v_dsa_topic_id, 'Merge Two Sorted Arrays without extra space'),
  (v_dsa_topic_id, 'Find the repeating and missing number'),
  (v_dsa_topic_id, 'Count Inversions (Merge Sort application)'),
  (v_dsa_topic_id, 'Reverse Pairs (Merge Sort application)');

  -- 6. Binary Search - 1D Arrays
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '6. Binary Search - 1D', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Binary Search Implementation'),
  (v_dsa_topic_id, 'Lower Bound and Upper Bound'),
  (v_dsa_topic_id, 'Search Insert Position'),
  (v_dsa_topic_id, 'First and Last occurrence of element'),
  (v_dsa_topic_id, 'Search in Rotated Sorted Array I & II'),
  (v_dsa_topic_id, 'Find minimum in Rotated Sorted Array'),
  (v_dsa_topic_id, 'Find single element in sorted array'),
  (v_dsa_topic_id, 'Find Peak Element');

  -- 7. Binary Search - On Answers
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '7. Binary Search - On Answers (Important)', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Square root of a number / Nth root of M'),
  (v_dsa_topic_id, 'Koko Eating Bananas'),
  (v_dsa_topic_id, 'Minimum days to make M bouquets'),
  (v_dsa_topic_id, 'Find the smallest divisor given a threshold'),
  (v_dsa_topic_id, 'Capacity to Ship Packages within D Days'),
  (v_dsa_topic_id, 'Aggressive Cows (Min/Max pattern)'),
  (v_dsa_topic_id, 'Allocate Minimum Number of Pages'),
  (v_dsa_topic_id, 'Split Array - Largest Sum'),
  (v_dsa_topic_id, 'Minimize Max Distance to Gas Station'),
  (v_dsa_topic_id, 'Median of 2 Sorted Arrays');

  -- 8. Binary Search - 2D Arrays
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '8. Binary Search - 2D Matrix', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Find row with maximum 1s'),
  (v_dsa_topic_id, 'Search in a 2D Matrix I (fully sorted)'),
  (v_dsa_topic_id, 'Search in a 2D Matrix II (row/col sorted)'),
  (v_dsa_topic_id, 'Find Peak Element in a 2D Matrix'),
  (v_dsa_topic_id, 'Median of Row Wise Sorted Matrix');

  -- 9. Strings
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '9. Strings (Basic & Medium)', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Remove outermost parentheses'),
  (v_dsa_topic_id, 'Reverse words in a given string'),
  (v_dsa_topic_id, 'Largest odd number in string'),
  (v_dsa_topic_id, 'Longest Common Prefix'),
  (v_dsa_topic_id, 'Isomorphic Strings'),
  (v_dsa_topic_id, 'Check whether one string is rotation of another'),
  (v_dsa_topic_id, 'Valid Anagram'),
  (v_dsa_topic_id, 'Sort characters by frequency'),
  (v_dsa_topic_id, 'Maximum Nesting Depth of Parentheses'),
  (v_dsa_topic_id, 'Roman to Integer / Integer to Roman'),
  (v_dsa_topic_id, 'String to Integer (atoi)');

  -- 10. Linked Lists - Basics
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '10. Linked Lists (1D & 2D)', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Introduction, Insert, Delete node in Singly LL'),
  (v_dsa_topic_id, 'Introduction, Insert, Delete node in Doubly LL'),
  (v_dsa_topic_id, 'Reverse a Doubly Linked List'),
  (v_dsa_topic_id, 'Middle of a Linked List'),
  (v_dsa_topic_id, 'Reverse a Linked List (Iterative & Recursive)'),
  (v_dsa_topic_id, 'Detect a Loop in LL (Tortoise & Hare)'),
  (v_dsa_topic_id, 'Find starting point of the loop'),
  (v_dsa_topic_id, 'Find length of the loop'),
  (v_dsa_topic_id, 'Palindrome Linked List');

  -- 11. Linked Lists - Hard Patterns
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '11. Linked Lists - Hard', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Delete Nth Node from End'),
  (v_dsa_topic_id, 'Sort LL (Merge Sort)'),
  (v_dsa_topic_id, 'Sort LL of 0s, 1s, and 2s'),
  (v_dsa_topic_id, 'Intersection of Two Linked Lists'),
  (v_dsa_topic_id, 'Add 2 Numbers represented by LL'),
  (v_dsa_topic_id, 'Reverse LL in groups of size K'),
  (v_dsa_topic_id, 'Rotate a LL'),
  (v_dsa_topic_id, 'Flattening of LL'),
  (v_dsa_topic_id, 'Clone LL with random and next pointer');

  -- 12. Recursion & Patterns
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '12. Recursion & Subsequences', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Generate all binary strings without consecutive 1s'),
  (v_dsa_topic_id, 'Generate Parentheses'),
  (v_dsa_topic_id, 'Print all subsequences/Power Set'),
  (v_dsa_topic_id, 'Combination Sum I & II'),
  (v_dsa_topic_id, 'Subset Sum I & II'),
  (v_dsa_topic_id, 'Print all Permutations of string/array'),
  (v_dsa_topic_id, 'Word Search (Grid)');

  -- 13. Backtracking
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '13. Backtracking', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'N-Queens Problem'),
  (v_dsa_topic_id, 'Rat in a Maze'),
  (v_dsa_topic_id, 'M-Coloring Problem'),
  (v_dsa_topic_id, 'Sudoku Solver'),
  (v_dsa_topic_id, 'Palindrome Partitioning');

  -- 14. Stack & Queues
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '14. Stacks & Queues - Basics', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Implement Stack/Queue using Arrays'),
  (v_dsa_topic_id, 'Implement Stack/Queue using Linked List'),
  (v_dsa_topic_id, 'Implement Stack using Queue & vice versa'),
  (v_dsa_topic_id, 'Valid Parentheses'),
  (v_dsa_topic_id, 'Min Stack (O(1) time and O(1) space)');

  -- 15. Monotonic Stack & Queue Patterns
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '15. Monotonic Stack Patterns (Important)', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Next Greater Element I & II'),
  (v_dsa_topic_id, 'Previous Smaller Element'),
  (v_dsa_topic_id, 'Trapping Rain Water'),
  (v_dsa_topic_id, 'Sum of Subarray Minimums'),
  (v_dsa_topic_id, 'Asteroid Collision'),
  (v_dsa_topic_id, 'Largest Rectangle in Histogram'),
  (v_dsa_topic_id, 'Maximal Rectangle in 2D Matrix'),
  (v_dsa_topic_id, 'Sliding Window Maximum (Using Deque)'),
  (v_dsa_topic_id, 'LRU Cache & LFU Cache Design');

  -- 16. Sliding Window & Two Pointer
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '16. Sliding Window & Two Pointer', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Longest Substring Without Repeating Characters'),
  (v_dsa_topic_id, 'Max Consecutive Ones III (with k flips)'),
  (v_dsa_topic_id, 'Fruits into Baskets'),
  (v_dsa_topic_id, 'Longest Repeating Character Replacement'),
  (v_dsa_topic_id, 'Count number of nice subarrays'),
  (v_dsa_topic_id, 'Number of Substrings Containing All Three Characters'),
  (v_dsa_topic_id, 'Maximum points you can obtain from cards'),
  (v_dsa_topic_id, 'Subarrays with K Different Integers'),
  (v_dsa_topic_id, 'Minimum Window Substring (Hard)');

  -- 17. Trees - Basics & Traversals
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '17. Binary Trees - Basics & Traversals', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Introduction to Trees (Terminology)'),
  (v_dsa_topic_id, 'Preorder, Inorder, Postorder Traversals (Recursive)'),
  (v_dsa_topic_id, 'Level Order Traversal (BFS)'),
  (v_dsa_topic_id, 'Iterative Preorder, Inorder, Postorder'),
  (v_dsa_topic_id, 'Maximum Depth/Height of Binary Tree'),
  (v_dsa_topic_id, 'Check if Binary Tree is Balanced'),
  (v_dsa_topic_id, 'Diameter of Binary Tree'),
  (v_dsa_topic_id, 'Check if two trees are Identical');

  -- 18. Trees - Medium & Hard
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '18. Binary Trees - Medium/Hard', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Maximum Path Sum'),
  (v_dsa_topic_id, 'Zig Zag Traversal'),
  (v_dsa_topic_id, 'Boundary Traversal'),
  (v_dsa_topic_id, 'Vertical Order Traversal'),
  (v_dsa_topic_id, 'Top View & Bottom View'),
  (v_dsa_topic_id, 'Right/Left View'),
  (v_dsa_topic_id, 'Symmetric Binary Tree'),
  (v_dsa_topic_id, 'Lowest Common Ancestor (LCA) in Binary Tree'),
  (v_dsa_topic_id, 'Construct Binary Tree from Inorder & Preorder/Postorder'),
  (v_dsa_topic_id, 'Serialize and Deserialize Binary Tree'),
  (v_dsa_topic_id, 'Morris Traversal (Preorder/Inorder in O(1) space)');

  -- 19. Binary Search Trees
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '19. Binary Search Trees (BST)', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Search in BST'),
  (v_dsa_topic_id, 'Find Min/Max in BST'),
  (v_dsa_topic_id, 'Insert & Delete Node in BST'),
  (v_dsa_topic_id, 'K-th Smallest/Largest Element in BST'),
  (v_dsa_topic_id, 'Validate BST'),
  (v_dsa_topic_id, 'LCA in BST'),
  (v_dsa_topic_id, 'Construct BST from Preorder Traversal'),
  (v_dsa_topic_id, 'Inorder Successor/Predecessor in BST'),
  (v_dsa_topic_id, 'Two Sum IV (Input is a BST)'),
  (v_dsa_topic_id, 'Recover BST (Two nodes swapped)'),
  (v_dsa_topic_id, 'Largest BST in Binary Tree');

  -- 20. Graphs - Basics & Traversals
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '20. Graphs - Basics & Traversals', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Graph Representation (Adjacency Matrix/List)'),
  (v_dsa_topic_id, 'Breadth First Search (BFS)'),
  (v_dsa_topic_id, 'Depth First Search (DFS)'),
  (v_dsa_topic_id, 'Number of Provinces (Connected Components)'),
  (v_dsa_topic_id, 'Rotting Oranges (BFS on Grid)'),
  (v_dsa_topic_id, 'Flood Fill'),
  (v_dsa_topic_id, '0/1 Matrix (Distance of nearest 0)'),
  (v_dsa_topic_id, 'Surrounded Regions (O''s and X''s)'),
  (v_dsa_topic_id, 'Number of Enclaves');

  -- 21. Graphs - Cycles & Topological Sort
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '21. Graphs - Cycles & Topo Sort', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Word Ladder I & II (Shortest Path BFS)'),
  (v_dsa_topic_id, 'Detect Cycle in Undirected Graph (BFS & DFS)'),
  (v_dsa_topic_id, 'Detect Cycle in Directed Graph (DFS)'),
  (v_dsa_topic_id, 'Bipartite Graph (BFS & DFS)'),
  (v_dsa_topic_id, 'Topological Sort (DFS)'),
  (v_dsa_topic_id, 'Kahn''s Algorithm (Topological Sort using BFS)'),
  (v_dsa_topic_id, 'Course Schedule I & II (Cycle Detection Directed)'),
  (v_dsa_topic_id, 'Find Eventual Safe States'),
  (v_dsa_topic_id, 'Alien Dictionary');

  -- 22. Graphs - Shortest Paths
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '22. Graphs - Shortest Path Algorithms', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Shortest Path in Undirected Graph with Unit Weights'),
  (v_dsa_topic_id, 'Shortest Path in Directed Acyclic Graph (DAG)'),
  (v_dsa_topic_id, 'Dijkstra''s Algorithm (PQ & Set implementation)'),
  (v_dsa_topic_id, 'Shortest Path in Weighted Undirected Graph (Print Path)'),
  (v_dsa_topic_id, 'Path With Minimum Effort'),
  (v_dsa_topic_id, 'Cheapest Flights Within K Stops'),
  (v_dsa_topic_id, 'Network Delay Time'),
  (v_dsa_topic_id, 'Bellman-Ford Algorithm (Negative cycles)'),
  (v_dsa_topic_id, 'Floyd Warshall Algorithm (All pairs shortest path)'),
  (v_dsa_topic_id, 'Find the City with the Smallest Number of Neighbors at Threshold Distance');

  -- 23. Graphs - MST & Disjoint Set
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '23. Graphs - MST & Disjoint Set', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Minimum Spanning Tree (MST) Overview'),
  (v_dsa_topic_id, 'Prim''s Algorithm'),
  (v_dsa_topic_id, 'Disjoint Set Union (DSU) - Find & Union by Rank/Size'),
  (v_dsa_topic_id, 'Kruskal''s Algorithm'),
  (v_dsa_topic_id, 'Number of Operations to Make Network Connected'),
  (v_dsa_topic_id, 'Most Stones Removed with Same Row or Column'),
  (v_dsa_topic_id, 'Account Merge'),
  (v_dsa_topic_id, 'Number of Islands II (Online Queries)'),
  (v_dsa_topic_id, 'Making a Large Island'),
  (v_dsa_topic_id, 'Swim in Rising Water');

  -- 24. Dynamic Programming - 1D & Grids
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '24. DP - 1D & Grids', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Introduction to DP (Memoization vs Tabulation)'),
  (v_dsa_topic_id, 'Climbing Stairs'),
  (v_dsa_topic_id, 'Frog Jump (1D)'),
  (v_dsa_topic_id, 'Maximum Sum of Non-Adjacent Elements (House Robber)'),
  (v_dsa_topic_id, 'House Robber II (Circular array)'),
  (v_dsa_topic_id, 'Ninja''s Training (2D DP)'),
  (v_dsa_topic_id, 'Grid Unique Paths'),
  (v_dsa_topic_id, 'Grid Unique Paths with Obstacles'),
  (v_dsa_topic_id, 'Minimum Path Sum in Grid'),
  (v_dsa_topic_id, 'Triangle Minimum Path Sum'),
  (v_dsa_topic_id, 'Minimum Falling Path Sum'),
  (v_dsa_topic_id, 'Cherry Pickup II (3D DP)');

  -- 25. Dynamic Programming - Subsequences & Strings
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '25. DP - Subsequences & Strings', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Subset Sum equal to target'),
  (v_dsa_topic_id, 'Partition Equal Subset Sum'),
  (v_dsa_topic_id, 'Partition a set into two subsets with minimum absolute sum diff'),
  (v_dsa_topic_id, 'Count Subsets with Sum K'),
  (v_dsa_topic_id, '0/1 Knapsack Problem'),
  (v_dsa_topic_id, 'Minimum Coins (Coin Change I)'),
  (v_dsa_topic_id, 'Target Sum'),
  (v_dsa_topic_id, 'Coin Change II (Total ways to make sum)'),
  (v_dsa_topic_id, 'Unbounded Knapsack'),
  (v_dsa_topic_id, 'Rod Cutting Problem'),
  (v_dsa_topic_id, 'Longest Common Subsequence (LCS)'),
  (v_dsa_topic_id, 'Print LCS'),
  (v_dsa_topic_id, 'Longest Common Substring'),
  (v_dsa_topic_id, 'Longest Palindromic Subsequence'),
  (v_dsa_topic_id, 'Minimum insertions to make string palindrome'),
  (v_dsa_topic_id, 'Edit Distance'),
  (v_dsa_topic_id, 'Wildcard Matching'),
  (v_dsa_topic_id, 'Regular Expression Matching');

  -- 26. Dynamic Programming - Stocks & LIS
  INSERT INTO study_topics (user_id, domain, title, source_name) VALUES (v_user_id, 'dsa', '26. DP - Stocks, LIS & MCM', 'Striver A2Z') RETURNING id INTO v_dsa_topic_id;
  INSERT INTO study_subtopics (topic_id, title) VALUES
  (v_dsa_topic_id, 'Best Time to Buy and Sell Stock II (Infinite Transactions)'),
  (v_dsa_topic_id, 'Best Time to Buy and Sell Stock III (At most 2 transactions)'),
  (v_dsa_topic_id, 'Best Time to Buy and Sell Stock IV (At most K transactions)'),
  (v_dsa_topic_id, 'Buy and Sell Stock with Cooldown'),
  (v_dsa_topic_id, 'Buy and Sell Stock with Transaction Fee'),
  (v_dsa_topic_id, 'Longest Increasing Subsequence (LIS) - Length & Print'),
  (v_dsa_topic_id, 'LIS using Binary Search (O(N log N))'),
  (v_dsa_topic_id, 'Largest Divisible Subset'),
  (v_dsa_topic_id, 'Longest String Chain'),
  (v_dsa_topic_id, 'Longest Bitonic Subsequence'),
  (v_dsa_topic_id, 'Number of LIS'),
  (v_dsa_topic_id, 'Matrix Chain Multiplication (MCM) Pattern Overview'),
  (v_dsa_topic_id, 'Minimum Cost to Cut a Stick'),
  (v_dsa_topic_id, 'Burst Balloons'),
  (v_dsa_topic_id, 'Evaluate Boolean Expression to True'),
  (v_dsa_topic_id, 'Palindrome Partitioning II');

END $$;
