from sentence_transformers import SentenceTransformer, util, models
import torch

titles=["HTML Tutorial", "CSS Tutorial", "JavaScript Tutorial", "Python Tutorial", "Java Tutorial"]

keywords=["coding", "programming", "web development", "data science", "machine learning"]
model = SentenceTransformer('all-MiniLM-L6-v2')  # lightweight model for speed
threshold = 0.4

# Encode titles and keywords
title_embeddings = model.encode(titles, convert_to_tensor=True)
keyword_embeddings = model.encode(keywords, convert_to_tensor=True)

#map the encoded tensor to the corresponding title
title_map = {}
for i in range(len(titles)):
    title_map[titles[i]] = title_embeddings[i]

#map the encoded tensor to the corresponding keyword
keyword_map = {}
for i in range(len(keywords)):
    keyword_map[keywords[i]] = keyword_embeddings[i]

# Compute similarities and filter
related_titles = []
for title_embedding in title_embeddings:
    for keyword_embedding in keyword_embeddings:
        similarity = util.pytorch_cos_sim(title_embedding, keyword_embedding)
        if similarity > threshold:
        #decode the tensor to corresponding title
            print("entered")
            for title, embedding in title_map.items():
                if torch.equal(embedding, title_embedding):
                    
                    related_titles.append(title)

print(related_titles)
