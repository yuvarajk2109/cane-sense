# CaneSense

**CaneSense** is a novel system for sugarcane disease detection, classification, and control, designed to help farmers maximize crop yield with ease.

## Features

### CaneSight
- Multi-level stacked deep learning ensemble using **CNN** and **LSTM**.
- Classifies sugarcane diseases from leaf images with **99.62% accuracy**.
- Reliable in real-world scenarios.

### CaneSpeak
- Natural language assistant (text & voice).
- Provides actionable guidelines for controlling classified diseases.
- Supports multiple languages.
- Uses embeddings and similarity search to map user queries to validated answers.

## Benefits
- Real-time, interactive interface for farmers.
- Comprehensive disease detection and control.
- User-friendly and easy to navigate.

## Getting Started
1. Clone the repository:  

   ```bash
   git clone https://github.com/yuvarajk2109/CaneSense.git
   ```
2. Create virtual environment, activate it, and install necessary Python packages as given in installs.txt.
3. Download the required dataset - choose anything from dataset_citations.md.
4. Based on the dataset downloaded, go to CaneSight/CaneSight.ipynb, and alter the model_name variable. The model_name variable can be main or mendeley_1 or mendeley_2, depending on the dataset downloaded.