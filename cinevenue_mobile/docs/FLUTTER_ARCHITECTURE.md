# CineVenue Flutter Mobile — Clean Architecture Guide

This document defines the architectural patterns, state management standards, and directory conventions for the CineVenue Flutter mobile app.

---

## 1. Architectural Principles

The application adopts **Feature-Driven Clean Architecture** with **Riverpod 2.x**:

* **Separation of Concerns**: Domain logic is separated from UI widgets and HTTP serialization.
* **Testability**: Every layer (data source, repository, state notifier) is fully mockable without Flutter UI dependencies.
* **Single Source of Truth**: Backend PostgreSQL via `/api/v1` is the authoritative source for prices, seat availability, and bookings.
* **Luxury Brand Aesthetics**: CineVenue dark visual identity (#0B0F17 dark background, #E5A93C warm gold, #E11D48 crimson accents).

---

## 2. Layer Definitions per Feature

Each feature in `lib/features/<feature_name>/` contains three distinct sub-layers:

```
lib/features/movies/
├── data/
│   ├── datasources/
│   │   └── movie_remote_data_source.dart   # Raw Dio API calls
│   ├── models/
│   │   └── movie_model.dart                # JSON deserialization (freezed / json_serializable)
│   └── repositories/
│       └── movie_repository_impl.dart      # Maps models to domain entities & catches network errors
├── domain/
│   ├── entities/
│   │   └── movie.dart                      # Pure Dart business entity
│   └── repositories/
│       └── movie_repository.dart           # Repository interface contract
└── presentation/
    ├── providers/
    │   └── movie_state_provider.dart       # Riverpod AsyncNotifier / StateNotifier
    ├── screens/
    │   ├── movie_showcase_screen.dart      # Main screen widget
    │   └── movie_detail_screen.dart
    └── widgets/
        ├── movie_card.dart
        └── trailer_player_widget.dart
```

---

## 3. Network Architecture (Dio & Interceptors)

### Token Refresh Queue Interceptor
```dart
class AuthInterceptor extends Interceptor {
  final Dio dio;
  final SecureStorageService storage;
  bool _isRefreshing = false;
  final List<Completer<Response>> _requestQueue = [];

  AuthInterceptor(this.dio, this.storage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !err.requestOptions.path.contains('/auth/refresh')) {
      // 1. Lock queue
      // 2. Call POST /api/v1/auth/refresh
      // 3. Update storage
      // 4. Retry queued requests with new token
    }
    handler.next(err);
  }
}
```

---

## 4. State Management with Riverpod

* Use `AsyncNotifierProvider` for asynchronous network requests.
* Use `StateProvider` for simple UI state (e.g. selected show date, selected city).
* Use `autoDispose` for view models to automatically free memory when screens are popped.

```dart
@riverpod
class MovieListNotifier extends _$MovieListNotifier {
  @override
  FutureOr<List<Movie>> build() async {
    final repository = ref.watch(movieRepositoryProvider);
    return repository.getNowShowingMovies();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(movieRepositoryProvider).getNowShowingMovies());
  }
}
```

