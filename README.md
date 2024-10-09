# YouTube Detoxifier - Custom YouTube Feed Curator (implementation in progress, first version of the code will be uploaded soon)

## 🌟 Overview

**YouTube Detoxifier** is a browser extension designed to enhance your YouTube experience by filtering out videos that don't align with your interests. It blurs irrelevant video recommendations based on user-defined keywords, helping you stay focused on content that matters.

## ✨ Features

- **Customizable Filters**: Define your own keywords to filter out unwanted content.
- **Blurring Unwanted Content**: Automatically blurs videos that do not match your criteria, allowing for a more focused browsing experience.
- **Smart Notifications**: Get prompts to search for desired topics if a significant portion of your recommendations are blurred.
- **Lightweight & User-Friendly**: Easy to set up and use with minimal impact on browser performance.
- **NLP-Powered Filtering (Planned)**: Future updates will include natural language processing to improve content relevance detection beyond just keyword matching.

## 🚀 Installation

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/Pranjal4697/Detoxify-youtube.git
    ```

2. **Load the Extension in Chrome:**
    - Go to `chrome://extensions/`
    - Enable "Developer mode"
    - Click "Load unpacked" and select the project directory

3. **Configure Keywords:**
    - Open the extension settings and enter your preferred keywords to start filtering.

## 🛠️ How It Works

The extension scans YouTube video titles and descriptions as you scroll through your feed. It uses keyword matching (and planned NLP techniques) to identify relevant content. Irrelevant videos are blurred to help you maintain focus.

## 🌐 Technologies Used

- **JavaScript**: Core scripting language for the extension.
- **HTML & CSS**: For the extension's user interface.
- **Google Cloud NLP API (Optional)**: Planned integration for advanced content filtering.

  
