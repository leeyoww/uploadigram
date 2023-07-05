const firebaseConfig = {
  apiKey: "AIzaSyBfPdkDg0TE9nypjCr9WDjHsDG6IGH2jLs",
  authDomain: "e-deez-nuts.firebaseapp.com",
  databaseURL: "https://e-deez-nuts-default-rtdb.firebaseio.com",
  projectId: "e-deez-nuts",
  storageBucket: "e-deez-nuts.appspot.com",
  messagingSenderId: "697154537749",
  appId: "1:697154537749:web:ecc196b856c431211f011c",
  measurementId: "G-PK0S05RY3D"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const postsContainer = document.getElementById("posts-container");
const postsCollection = db.collection("dang");
// Add this code at the top of your JavaScript file
const notificationContainer = document.getElementById("notification-container");


// Function to display existing posts
function displayPosts() {
  postsCollection
    .orderBy("timestamp", "desc")
    .get()
    .then(function(querySnapshot) {
      postsContainer.innerHTML = ""; // Clear the existing posts

      querySnapshot.forEach(function(doc) {
        const post = doc.data();

        const postElement = document.createElement("div");
        postElement.classList.add("post");

        const titleElement = document.createElement("h2");
        const contentElement = document.createElement("p");
        const authorElement = document.createElement("p");
        authorElement.classList.add("author");
        const likeButton = document.createElement("button");
        likeButton.classList.add("like-button");
        likeButton.innerHTML = `<i class="far fa-thumbs-up"></i> Like`;
        const likeCounter = document.createElement("span");
        likeCounter.classList.add("like-counter");

        titleElement.textContent = post.title;
        contentElement.textContent = post.content;
        authorElement.textContent = "@" + post.author; // Replace "Author" with "@"

        postElement.appendChild(titleElement);
        postElement.appendChild(contentElement);
        postElement.appendChild(authorElement);
        postElement.appendChild(likeButton);
        postElement.appendChild(likeCounter);
        postsContainer.appendChild(postElement);

        // Check if the user has liked the post and update the like button color
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;

          postsCollection
            .doc(doc.id)
            .collection("likes")
            .doc(userId)
            .get()
            .then(function(likeDoc) {
              if (likeDoc.exists) {
                likeButton.classList.add("liked");
                likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i> Liked`;
              }
            });
        }

        // Attach event listener to the like button
        likeButton.addEventListener("click", function() {
          likePost(doc.id, likeButton, likeCounter, post.author);
        });

        // Fetch and display comments for the post
        const commentsContainer = document.createElement("div");
        commentsContainer.classList.add("comments-container");
        postElement.appendChild(commentsContainer);

        postsCollection
          .doc(doc.id)
          .collection("comments")
          .orderBy("timestamp", "asc")
          .get()
          .then(function(commentQuerySnapshot) {
            commentsContainer.innerHTML = ""; // Clear existing comments

            commentQuerySnapshot.forEach(function(commentDoc) {
              const comment = commentDoc.data();

              const commentElement = document.createElement("div");
              commentElement.classList.add("comment");

              const commentAuthorElement = document.createElement("p");
              commentAuthorElement.textContent = "@" + comment.author; // Replace "Author" with "@"

              const commentContentElement = document.createElement("p");
              commentContentElement.textContent = comment.content;

              commentElement.appendChild(commentAuthorElement);
              commentElement.appendChild(commentContentElement);
              commentsContainer.appendChild(commentElement);
            });
          });

        // Comment form for the post
        const commentForm = document.createElement("div");
        commentForm.classList.add("comment-form");
        const commentInput = document.createElement("input");
        commentInput.type = "text";
        commentInput.placeholder = "Add a comment";
        const commentButton = document.createElement("button");
        commentButton.textContent = "Comment";
        commentForm.appendChild(commentInput);
        commentForm.appendChild(commentButton);
        postElement.appendChild(commentForm);

        // Event listener for adding a comment
        commentButton.addEventListener("click", function() {
          const commentContent = commentInput.value;
          const commentAuthor = auth.currentUser.displayName;

          if (commentContent && commentAuthor) {
            addComment(doc.id, commentContent, commentAuthor, commentsContainer, commentInput);
          }
        });
      });
    });
}

// Function to display a notification
function displayNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  notificationContainer.appendChild(notification);
}
// Update the likePost function to display the notification
function likePost(postId, likeButton, likeCounter) {
  const currentUser = auth.currentUser;

  // ...

  if (currentUser) {
    // ...

    postsCollection
      .doc(postId)
      .collection("likes")
      .doc(userId)
      .get()
      .then(function (doc) {
        // ...

        if (doc.exists) {
          // ...

          // Display a notification when the post is liked
          displayNotification("Your post was liked!");
        } else {
          // ...
        }
      })
      .catch(function (error) {
        console.error("Error checking like status: ", error);
      });
  } else {
    console.log("User not signed in");
  }
}
// Usage example:
// displayNotification("Someone liked your post!");


// Function to add a comment to a post
function addComment(postId, content, author) {
  const commentData = {
    content: content,
    author: author,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  postsCollection
    .doc(postId)
    .collection("comments")
    .add(commentData)
    .then(function() {
      console.log("Comment added");

      // Refresh the posts
      displayPosts();
    })
    .catch(function(error) {
      console.error("Error adding comment: ", error);
    });
}

// Function to add a new post
function addPost() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const author = auth.currentUser.displayName; // Get the display name of the currently signed-in user

  postsCollection
    .add({
      title: title,
      content: content,
      author: author,
      likes: 0, // Initialize the likes count to 0
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function() {
      // Clear the form inputs
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";

      // Refresh the posts
      displayPosts();
    })
    .catch(function(error) {
      console.error("Error adding post: ", error);
    });
}


// Function to like/unlike a post
function likePost(postId, likeButton) {
  const currentUser = auth.currentUser;

  // Check if user is signed in
  if (currentUser) {
    const userId = currentUser.uid;

    postsCollection
      .doc(postId)
      .collection("likes")
      .doc(userId)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          // User has already liked the post, remove the like
          postsCollection
            .doc(postId)
            .collection("likes")
            .doc(userId)
            .delete()
            .then(function() {
              console.log("Like removed");

              // Update the like button appearance
              likeButton.classList.remove("liked");
              likeButton.innerHTML = `<i class="far fa-thumbs-up"></i> Like`;

              // Refresh the posts
              displayPosts();
            })
            .catch(function(error) {
              console.error("Error removing like: ", error);
            });
        } else {
          // User has not liked the post, add the like
          postsCollection
            .doc(postId)
            .collection("likes")
            .doc(userId)
            .set({ liked: true })
            .then(function() {
              console.log("Like added");

              // Update the like button appearance
              likeButton.classList.add("liked");
              likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i> Liked`;

              // Refresh the posts
              displayPosts();
            })
            .catch(function(error) {
              console.error("Error adding like: ", error);
            });
        }
      })
      .catch(function(error) {
        console.error("Error checking like status: ", error);
      });
  } else {
    console.log("User not signed in");
  }
}

// Display existing posts on page load
displayPosts();