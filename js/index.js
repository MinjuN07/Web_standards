document.addEventListener('DOMContentLoaded', function () {
	const today = new Date()
	today.setDate(today.getDate() - 2) // 오늘 날짜에서 2일을 빼서 '2일 전' 날짜를 계산
	const formattedDate = today.toISOString().split('T')[0] // 날짜를 'YYYY-MM-DD' 형식으로 포맷

	document.getElementById('targetDate').value = formattedDate // '2일 전' 날짜로 input 필드 설정
	fetchData() // 데이터 초기 조회 실행

	// 날짜, 영화 타입, 국가 타입 변경 시 데이터 다시 조회
	document.getElementById('targetDate').addEventListener('change', fetchData)
	document.getElementById('movieType').addEventListener('change', fetchData)
	document.getElementById('nationType').addEventListener('change', fetchData)
})

async function fetchData() {
	const targetDate = document.getElementById('targetDate').value.replaceAll('-', '')
	const movieType = document.getElementById('movieType').value
	const nationType = document.getElementById('nationType').value
	fetchBoxOffice(targetDate, movieType, nationType)
}

async function fetchBoxOffice(targetDt, weekGb, repNationCd) {
	const apiKey = 'ea3da279020673d762e575c255ce24f7' // Kobis API 키
	const itemPerPage = '10'
	const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json?key=${apiKey}&targetDt=${targetDt}&weekGb=${weekGb}&repNationCd=${repNationCd}&itemPerPage=${itemPerPage}`

	try {
		const response = await fetch(url)
		const data = await response.json()
		if (data.faultInfo || !data.boxOfficeResult) {
			displayErrorMessage('영화 데이터를 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요. 혹은 날짜를 변경 해주세요.') // 이해의 용이성 오류 발생 시 오류의 원인 파악 도움
		} else {
			displayResults(data)
		}
	} catch (error) {
		displayErrorMessage('영화 데이터를 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요. 혹은 날짜를 변경 해주세요.') // 이해의 용이성 오류 발생 시 오류의 원인 파악 도움
	}
}

function displayErrorMessage(message) {
	const results = document.getElementById('results')
	results.innerHTML = `<p>${message}</p>`
}

async function fetchTmdbMovieId(movieName) {
	const tmdbApiKey = '0ebe27b5c67b132b38d0a0d9df7b481e' // TMDb API 키
	const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&language=ko-KR&query=${encodeURIComponent(
		movieName
	)}&page=1&include_adult=false`
	const response = await fetch(url)
	const data = await response.json()
	return data.results.length > 0 ? data.results[0].id : null
}

async function fetchMovieImage(movieName) {
	const movieId = await fetchTmdbMovieId(movieName)
	if (!movieId) return { imageUrl: 'default_poster.jpg', altText: movieName } // 영화 ID가 없을 경우 기본 포스터 사용
	const tmdbApiKey = '0ebe27b5c67b132b38d0a0d9df7b481e' // TMDb API 키
	const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&language=ko-KR`
	const response = await fetch(url)
	const data = await response.json()
	return {
		imageUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'default_poster.jpg',
		altText: movieName,
	}
}

async function displayResults(data) {
	const results = document.getElementById('results')
	results.innerHTML = '' // 이전 결과 초기화

	if (data.boxOfficeResult && data.boxOfficeResult.weeklyBoxOfficeList.length > 0) {
		const movies = data.boxOfficeResult.weeklyBoxOfficeList
		for (const movie of movies) {
			const { imageUrl, altText } = await fetchMovieImage(movie.movieNm) // 인식의 용이성 영화 이름을 사용하여 이미지와 alt 텍스트 검색 -> alt 마크업 제공
			const movieEl = document.createElement('div')
			movieEl.classList.add('movie')
			movieEl.innerHTML = `
                <img src="${imageUrl}" alt="${altText}" style="height:300px;">
                <h3>${movie.movieNm} (${movie.openDt})</h3>
                <p>순위: ${movie.rank}, 누적 관객수: ${movie.audiAcc}</p>
            `
			results.appendChild(movieEl)
		}
	} else {
		results.innerHTML = '<p>영화 데이터를 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요. 혹은 날짜를 변경 해주세요.</p>' // 이해의 용이성 오류 발생 시 오류의 원인 파악 도움
	}
}

function showAlert() {
	location.href = 'rank.html'
}

function toggleVideo() {
	const heroVideo = document.getElementById('hero-video')
	const videoControlButton = document.getElementById('video-control-button')

	if (heroVideo.paused) {
		// 운영의 용이성 동영상 정지 기능 제공
		heroVideo.play()
		videoControlButton.textContent = 'Pause'
	} else {
		heroVideo.pause()
		videoControlButton.textContent = 'Play'
	}
}
