# Deep Learning Lab Programs -- Experiments 7 to 10

## Experiment 7: VGG16 vs ResNet50 using MNIST

``` python
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras.applications import VGG16, ResNet50
from tensorflow.keras import layers, Sequential

(x, y), (xt, yt) = tf.keras.datasets.mnist.load_data()
x, y = x[:1000], y[:1000]
xt, yt = xt[:200], yt[:200]

x = tf.image.resize(x[..., None], (32, 32))
xt = tf.image.resize(xt[..., None], (32, 32))
x = tf.repeat(x, 3, axis=-1)
xt = tf.repeat(xt, 3, axis=-1)

acc = []
pred = []

for net in [VGG16, ResNet50]:
    base = net(weights="imagenet", include_top=False, input_shape=(32, 32, 3))
    base.trainable = False

    model = Sequential([
        base,
        layers.Flatten(),
        layers.Dense(10, activation="softmax")
    ])

    model.compile("adam", "sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(x, y, epochs=2, verbose=0)

    acc.append(model.evaluate(xt, yt, verbose=0)[1] * 100)
    pred.append(model.predict(xt[:5], verbose=0).argmax(axis=1))

for i in range(5):
    plt.subplot(1, 5, i + 1)
    plt.imshow(xt[i, :, :, 0], cmap="gray")
    plt.title(f"T:{yt[i]}\\nV:{pred[0][i]} R:{pred[1][i]}")
    plt.axis("off")
plt.show()

plt.bar(["VGG16", "ResNet50"], acc)
plt.ylabel("Accuracy (%)")
plt.show()

print("VGG16:", round(acc[0], 2), "%")
print("ResNet50:", round(acc[1], 2), "%")
```

## Experiment 8: French-to-English Translation using Encoder--Decoder with Attention

``` python
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import *
from tensorflow.keras.models import Model

# Dataset
fr = ["bonjour", "merci", "au revoir", "bonjour ami", "je suis heureux"]
en = ["hello", "thank you", "goodbye", "hello friend", "i am happy"]

# Tokenization
ft, et = Tokenizer(), Tokenizer(filters="")
ft.fit_on_texts(fr)
et.fit_on_texts(["start " + s + " end" for s in en])

X = pad_sequences(ft.texts_to_sequences(fr), padding="post")
Y = pad_sequences(et.texts_to_sequences(["start " + s + " end" for s in en]), padding="post")
A, B = Y[:, :-1], Y[:, 1:]

# Encoder
i = Input((X.shape[1],))
e = Embedding(len(ft.word_index) + 1, 32, mask_zero=True)(i)
eo, h, c = LSTM(32, return_sequences=True, return_state=True)(e)

# Decoder with Attention
j = Input((A.shape[1],))
d = Embedding(len(et.word_index) + 1, 32, mask_zero=True)(j)
do = LSTM(32, return_sequences=True)(d, initial_state=[h, c])
a = Attention()([do, eo])
o = Dense(len(et.word_index) + 1, activation="softmax")(Concatenate()([do, a]))

# Training
m = Model([i, j], o)
m.compile("adam", "sparse_categorical_crossentropy", metrics=["accuracy"])
m.fit([X, A], B[..., None], epochs=500, verbose=0)

# Prediction
p = m.predict([X[:1], A[:1]], verbose=0).argmax(-1)[0]
words = [et.index_word[x] for x in p if x in et.index_word and
         x not in [et.word_index["start"], et.word_index["end"]]]

# Accuracy
pred = m.predict([X, A], verbose=0).argmax(-1)
mask = B != 0
acc = np.mean(pred[mask] == B[mask]) * 100

print("French: bonjour")
print("English:", " ".join(words))
print("Word Accuracy:", round(acc, 1), "%")
```

To predict another sentence, use the matching row in both inputs. For
example, use `X[1:2]` and `A[1:2]` for `merci`.

## Experiment 9: Movie Review Sentiment Analysis using DistilBERT and IMDb

First install the required packages:

``` python
!pip -q install transformers datasets scikit-learn
```

Then run:

``` python
from datasets import load_dataset
from transformers import pipeline
from sklearn.metrics import accuracy_score, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

# Load IMDb dataset
data = load_dataset("stanfordnlp/imdb", split="test[:200]")

reviews = data["text"]
actual = data["label"]

print("Total reviews:", len(reviews))

# Load DistilBERT model
m = pipeline("sentiment-analysis",
             model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")

# Predict sentiment
pred = []
for r in reviews:
    p = m(r[:512])[0]["label"]
    pred.append(1 if p == "POSITIVE" else 0)

# Display results
for r, p in zip(reviews[:5], pred[:5]):
    print(r[:100], "->", ["Negative", "Positive"][p])

# Accuracy
print("Accuracy:", round(accuracy_score(actual, pred) * 100, 2), "%")

# Confusion Matrix
ConfusionMatrixDisplay.from_predictions(
    actual, pred, display_labels=["Negative", "Positive"])
plt.show()
```

Note: This evaluates a pretrained DistilBERT model on IMDb reviews; it
does not fine-tune the model on IMDb. Accuracy is an actual measured
result and is not guaranteed to be 100%.

## Experiment 10: Generative Adversarial Network (GAN) using MNIST

``` python
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras import Sequential
from tensorflow.keras.layers import *

# Generator
G = Sequential([
    Input((100,)),
    Dense(784, activation="tanh"),
    Reshape((28, 28, 1))
])

# Discriminator
D = Sequential([
    Input((28, 28, 1)),
    Flatten(),
    Dense(256),
    LeakyReLU(negative_slope=0.2),
    Dense(1, activation="sigmoid")
])

# Compile models
D.compile(optimizer="adam", loss="binary_crossentropy")
G.compile(optimizer="adam", loss="mse")

# Load MNIST dataset
(x, _), _ = tf.keras.datasets.mnist.load_data()
x = x[:500, ..., None].astype("float32") / 127.5 - 1

# Train GAN
for i in range(3000):
    z = tf.random.normal((32, 100))
    real = x[tf.random.uniform((32,), 0, 500, dtype=tf.int32)]

    # Train Discriminator
    D.train_on_batch(real, tf.ones((32, 1)))
    D.train_on_batch(G(z), tf.zeros((32, 1)))

    # Train Generator
    with tf.GradientTape() as tape:
        fake = G(z)
        loss = tf.keras.losses.binary_crossentropy(
            tf.ones((32, 1)), D(fake))

    grads = tape.gradient(loss, G.trainable_variables)
    G.optimizer.apply_gradients(zip(grads, G.trainable_variables))

# Generate images
imgs = tf.concat([x[:5], G(tf.random.normal((5, 100)))], axis=0)

# Display images
for i in range(10):
    plt.subplot(2, 5, i + 1)
    plt.imshow(imgs[i, :, :, 0], cmap="gray")
    plt.title("Real" if i < 5 else "Fake")
    plt.axis("off")

plt.show()
```

**GAN note:** This is the short basic version from the experiment. With
only 500 training images and 3,000 iterations, generated images may look
noisy. The Generator and Discriminator are competing networks; output
quality is not guaranteed.
