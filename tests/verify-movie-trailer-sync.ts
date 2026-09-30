import { getActiveMovieVideos, getPrimaryMovieTrailer } from '../src/utils/movieAvailability';
import { parseAndValidateYouTubeUrl } from '../src/utils/youtube';
import { Movie } from '../src/types';

function runTest() {
  console.log('--- Testing Movie Trailer Sync & Synthesis ---');

  // Test 1: YouTube URL parser
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
  ];

  for (const url of testUrls) {
    const res = parseAndValidateYouTubeUrl(url);
    if (!res.isValid || res.videoId !== 'dQw4w9WgXcQ') {
      throw new Error(`Failed parsing YouTube URL: ${url}`);
    }
  }
  console.log('✓ parseAndValidateYouTubeUrl passed for all URL formats');

  // Test 2: Movie created from Admin with only trailerUrl
  const movieFromAdminWithTrailerUrl: Movie = {
    id: 'm-test-1',
    title: 'Devara: Part 1',
    genre: 'Action, Drama',
    lang: 'Telugu',
    duration: '170 mins',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  };

  const videos = getActiveMovieVideos(movieFromAdminWithTrailerUrl);
  if (videos.length !== 1) {
    throw new Error(`Expected 1 synthesized trailer video, got ${videos.length}`);
  }
  if (videos[0].type !== 'TRAILER' || videos[0].youtubeVideoId !== 'dQw4w9WgXcQ') {
    throw new Error(`Trailer video fields incorrect: ${JSON.stringify(videos[0])}`);
  }

  const primaryTrailer = getPrimaryMovieTrailer(movieFromAdminWithTrailerUrl);
  if (!primaryTrailer || primaryTrailer.youtubeVideoId !== 'dQw4w9WgXcQ') {
    throw new Error(`Primary trailer extraction failed!`);
  }
  console.log('✓ getActiveMovieVideos synthesized trailer from movie.trailerUrl');

  // Test 3: Movie with existing videos array preserving order
  const movieWithExplicitVideos: Movie = {
    id: 'm-test-2',
    title: 'Kalki 2898 AD',
    trailerUrl: 'https://www.youtube.com/watch?v=kalki123456',
    videos: [
      {
        id: 'vid-custom',
        movieId: 'm-test-2',
        type: 'TRAILER',
        title: 'Kalki Official Trailer 2',
        youtubeUrl: 'https://www.youtube.com/watch?v=kalki789101',
        youtubeVideoId: 'kalki789101',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  const kalkiVideos = getActiveMovieVideos(movieWithExplicitVideos);
  if (kalkiVideos.length === 0 || kalkiVideos[0].youtubeVideoId !== 'kalki789101') {
    throw new Error(`Explicit videos should take precedence without duplicate synthetic trailer`);
  }
  console.log('✓ Explicit videos preserved cleanly');

  console.log('\n✅ ALL MOVIE TRAILER TESTS PASSED PERFECTLY!');
}

runTest();
