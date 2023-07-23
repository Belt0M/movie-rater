const apiKey = '6a4db98e'
const itemsPerPage = 10

const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const movieListContainer = document.getElementById('movie-list')
const paginationContainer = document.getElementById('pagination')
const movieDetailsContainer = document.getElementById('movie-details')
const closeButton = document.getElementById('close-button')

let currentPage = 1
let totalResults = 0
let currentSearchQuery = ''

async function fetchMovies(query, page) {
	const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&page=${page}`
	try {
		const response = await fetch(url)
		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error fetching movie data:', error)
		return null
	}
}

function displayMovies(movies) {
	// Clear previous movie list
	movieListContainer.innerHTML = ''

	// Create movie list items and append to container
	movies.forEach(movie => {
		const movieItem = document.createElement('div')
		// Customize the HTML structure to display movie poster and name
		movieItem.innerHTML = `
      <img src="${movie.Poster}" alt="${movie.Title}" />
      <h3>${movie.Title}</h3>
    `
		// Add event listener to show movie details when clicked
		movieItem.addEventListener('click', () => showMovieDetails(movie.imdbID))
		movieListContainer.appendChild(movieItem)
	})
}

function displayPagination() {
	paginationContainer.innerHTML = ''
	const i2 = document.createElement('i')
	i2.className = 'fa-solid fa-chevron-left'
	i2.addEventListener('click', () => handlePageChange('previous'))
	paginationContainer.appendChild(i2)
	const totalPages = Math.ceil(totalResults / itemsPerPage)
	for (let page = 1; page <= totalPages; page++) {
		const button = document.createElement('button')
		button.textContent = page
		button.addEventListener('click', () => handlePageChange(page))
		paginationContainer.appendChild(button)
		if (page === totalPages) {
			const i = document.createElement('i')
			i.className = 'fa-solid fa-chevron-right'
			i.addEventListener('click', () => handlePageChange('next'))
			paginationContainer.appendChild(i)
		}
	}
}

function handlePageChange(page) {
	console.log(currentPage, page)
	const totalPages = Math.ceil(totalResults / itemsPerPage)
	if (currentPage > 1 && page == 'previous') {
		console.log(currentPage)
		currentPage--
	} else if (currentPage < totalPages && page == 'next') {
		currentPage++
	}

	if (Number.isInteger(page)) {
		currentPage = page
	}

	searchMovies(currentSearchQuery)
}

function searchMovies(query) {
	currentSearchQuery = query
	fetchMovies(query, currentPage)
		.then(data => {
			if (data && data.Search) {
				totalResults = parseInt(data.totalResults)
				displayMovies(data.Search)
				displayPagination()
			} else {
				movieListContainer.innerHTML = '<p>No results found.</p>'
				paginationContainer.innerHTML = ''
			}
		})
		.catch(error => {
			console.error('Error searching movies:', error)
		})
}

async function showMovieDetails(movieId) {
	movieDetailsContainer.classList.toggle('active')
	const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`

	try {
		const response = await fetch(url)
		const data = await response.json()
		console.log(data)
		const movieDetailsTemplate = `
        <h2>${data.Title} (${data.Year})</h2>
        <p>IMDb Rating: <span>${data.imdbRating}</span> </p>
        <p>Genre: <span>${data.Genre}</span></p>
        <p>Director: <span>${data.Director}</span></p>
        <p>Actors: <span>${data.Actors}</span></p>
        <p>Language: <span>${data.Language}</span></p>
        <p>Plot: <span>${data.Plot}</span></p>
        <div class="user-rating">
          <p>Your Rating:</p>
          <div>
          <div class="stars">
          ${getRatingStarsHtml(movieId)}  
          </div> 
          <textarea id="comment-${movieId}" placeholder="Leave a comment"></textarea>   
          
          <button onclick="submitRatingAndComment('${movieId}')">Submit</button>
          </div>
        </div>
      `
		movieDetailsContainer.innerHTML = `
    <button id="close-button" class="close-button"><i class="fa-solid fa-xmark"></i></button>
  `
		movieDetailsContainer.innerHTML += movieDetailsTemplate
		movieDetailsContainer.classList.toggle('active')

		// Get user rating and comment from local storage, if available
		const closeButtonInsideDetails = document.getElementById('close-button')
		if (closeButtonInsideDetails) {
			closeButtonInsideDetails.addEventListener('click', () => {
				hideMovieDetails()
			})
		}

		const userRating = getUserRating(movieId)
		const userComment = getUserComment(movieId)
		if (userRating !== null) {
			setRatingStars(userRating, movieId)
		}
		if (userComment !== null) {
			const commentTextArea = document.getElementById(`comment-${movieId}`)
			commentTextArea.value = userComment
		}
	} catch (error) {
		console.error('Error fetching movie details:', error)
	}
}

function hideMovieDetails() {
	movieDetailsContainer.classList.remove('active')
}

// Event listener to show movie details when a movie is clicked
movieListContainer.addEventListener('click', event => {
	const movieItem = event.target.closest('div')
	if (movieItem) {
		const movieId = movieItem.dataset.movieId
		showMovieDetails(movieId)
	}
})

// Event listener to hide movie details when the close button is clicked
document.addEventListener('click', event => {
	if (
		!movieDetailsContainer.contains(event.target) &&
		!event.target.matches('div[data-movie-id]')
	) {
		hideMovieDetails()
	}
})

// Event listener to hide movie details when clicking outside the container
document.addEventListener('click', event => {
	if (
		!movieDetailsContainer.contains(event.target) &&
		!event.target.matches('div[data-movie-id]')
	) {
		hideMovieDetails()
	}
})

// Event listener to search for movies when the search button is clicked
searchButton.addEventListener('click', () => {
	const searchQuery = searchInput.value.trim()
	if (searchQuery !== '') {
		currentPage = 1
		searchMovies(searchQuery)
	}
})

// Function to get user comment from local storage
function getUserComment(movieId) {
	const userComments = JSON.parse(localStorage.getItem('userComments')) || {}
	return userComments[movieId] || null
}

// Function to get user rating from local storage
function getUserRating(movieId) {
	const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {}
	return userRatings[movieId] || null
}

// Function to set user rating in local storage
function setUserRating(movieId, rating) {
	const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {}
	userRatings[movieId] = rating
	localStorage.setItem('userRatings', JSON.stringify(userRatings))
}

// Function to set user comment in local storage
function setUserComment(movieId, comment) {
	const userComments = JSON.parse(localStorage.getItem('userComments')) || {}
	userComments[movieId] = comment
	localStorage.setItem('userComments', JSON.stringify(userComments))
}

function getRatingStarsHtml(movieId) {
	// Customize the HTML structure for the star rating system
	const stars = ['star', 'star', 'star', 'star', 'star'] // Default all stars to full
	return stars
		.map(
			(star, index) =>
				`<span class="star" onclick="setRatingStars(${
					index + 1
				}, '${movieId}')">${star}</span>`
		)
		.join('')
}

function setRatingStars(rating, movieId) {
	// Set the selected rating stars to indicate user's rating
	const stars = document.querySelectorAll(`.user-rating span`)
	stars.forEach((star, index) => {
		if (index < rating) {
			star.textContent = '★' // Filled star
		} else {
			star.textContent = '☆' // Empty star
		}
	})

	// Save the user rating in local storage
	localStorage.setItem(`rating-${movieId}`, rating)
}

function getUserRating(movieId) {
	return parseInt(localStorage.getItem(`rating-${movieId}`))
}

function submitRatingAndComment(movieId) {
	const commentTextArea = document.getElementById(`comment-${movieId}`)
	console.log(commentTextArea.value)
	const userComment = commentTextArea.value.trim()

	// Save the user comment in local storage
	localStorage.setItem(`comment-${movieId}`, userComment)

	console.log(localStorage.getItem(`comment-${movieId}`))

	// Optionally, you can implement logic to send the rating and comment data to a server here

	alert('Rating and comment submitted successfully!')
}

searchButton.addEventListener('click', () => {
	const searchQuery = searchInput.value.trim()
	if (searchQuery !== '') {
		currentPage = 1
		searchMovies(searchQuery)
	}
})

searchMovies('avengers')
