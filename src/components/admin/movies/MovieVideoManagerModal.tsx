import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Trash2, Edit2, Eye, Check, AlertCircle, Film, ArrowUp, ArrowDown } from 'lucide-react';
import { Movie, MovieVideo, VideoType } from '../../../types';
import { parseAndValidateYouTubeUrl, buildSafeYouTubeEmbedUrl } from '../../../utils/youtube';

interface MovieVideoManagerModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
  onSaveVideos: (updatedMovie: Movie) => void;
}

export default function MovieVideoManagerModal({
  isOpen,
  movie,
  onClose,
  onSaveVideos,
}: MovieVideoManagerModalProps) {
  const [videos, setVideos] = useState<MovieVideo[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Form states
  const [videoType, setVideoType] = useState<VideoType>('TRAILER');
  const [videoTitle, setVideoTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('Telugu');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [extractedVideoId, setExtractedVideoId] = useState<string | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);

  // Live video player modal state
  const [previewingVideo, setPreviewingVideo] = useState<MovieVideo | null>(null);

  useEffect(() => {
    if (movie) {
      setVideos(movie.videos || []);
    } else {
      setVideos([]);
    }
    resetForm();
  }, [movie, isOpen]);

  // Live URL validation and ID extraction as user types
  useEffect(() => {
    if (!youtubeUrl.trim()) {
      setExtractedVideoId(null);
      setPreviewThumbnail(null);
      setValidationError(null);
      return;
    }
    const result = parseAndValidateYouTubeUrl(youtubeUrl);
    if (result.isValid && result.videoId) {
      setExtractedVideoId(result.videoId);
      setPreviewThumbnail(result.thumbnailUrl);
      setValidationError(null);
    } else {
      setExtractedVideoId(null);
      setPreviewThumbnail(null);
      setValidationError(result.errorMessage || 'Invalid YouTube URL format.');
    }
  }, [youtubeUrl]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingVideoId(null);
    setVideoType('TRAILER');
    setVideoTitle('');
    setYoutubeUrl('');
    setLanguage(movie?.lang || 'Telugu');
    setDisplayOrder((videos.length || 0) + 1);
    setIsActive(true);
    setValidationError(null);
    setExtractedVideoId(null);
    setPreviewThumbnail(null);
  };

  const handleStartEdit = (video: MovieVideo) => {
    setEditingVideoId(video.id);
    setIsAdding(true);
    setVideoType(video.type);
    setVideoTitle(video.title);
    setYoutubeUrl(video.youtubeUrl);
    setLanguage(video.language || movie?.lang || 'Telugu');
    setDisplayOrder(video.displayOrder || 1);
    setIsActive(video.isActive !== false);
  };

  const handleSaveVideoItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!extractedVideoId) {
      setValidationError('Please provide a valid YouTube URL before saving.');
      return;
    }

    if (!videoTitle.trim()) {
      setValidationError('Please provide a video title.');
      return;
    }

    const now = new Date().toISOString();
    let updatedList: MovieVideo[];

    if (editingVideoId) {
      updatedList = videos.map((v) =>
        v.id === editingVideoId
          ? {
              ...v,
              type: videoType,
              title: videoTitle.trim(),
              youtubeUrl: youtubeUrl.trim(),
              youtubeVideoId: extractedVideoId,
              thumbnailUrl: previewThumbnail || undefined,
              language: language.trim(),
              displayOrder: Number(displayOrder) || 1,
              isActive,
              updatedAt: now,
            }
          : v
      );
    } else {
      const newVideo: MovieVideo = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        movieId: movie?.id || movie?._id || movie?.title || 'unknown',
        type: videoType,
        title: videoTitle.trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeVideoId: extractedVideoId,
        thumbnailUrl: previewThumbnail || undefined,
        language: language.trim(),
        displayOrder: Number(displayOrder) || (videos.length + 1),
        isActive,
        createdAt: now,
        updatedAt: now,
      };
      updatedList = [...videos, newVideo];
    }

    // Sort by display order
    updatedList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    setVideos(updatedList);
    if (movie) {
      const updatedMovie: Movie = {
        ...movie,
        videos: updatedList,
      };
      onSaveVideos(updatedMovie);
    }
    resetForm();
  };

  const handleDeleteVideo = (id: string) => {
    const updatedList = videos.filter((v) => v.id !== id);
    setVideos(updatedList);
    if (movie) {
      onSaveVideos({
        ...movie,
        videos: updatedList,
      });
    }
  };

  const handleToggleActive = (id: string) => {
    const updatedList = videos.map((v) =>
      v.id === id ? { ...v, isActive: !v.isActive, updatedAt: new Date().toISOString() } : v
    );
    setVideos(updatedList);
    if (movie) {
      onSaveVideos({
        ...movie,
        videos: updatedList,
      });
    }
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const listCopy = [...videos];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    // Reassign displayOrder indices 1..N
    const reindexed = listCopy.map((v, idx) => ({
      ...v,
      displayOrder: idx + 1,
      updatedAt: new Date().toISOString(),
    }));

    setVideos(reindexed);
    if (movie) {
      onSaveVideos({
        ...movie,
        videos: reindexed,
      });
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Background click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Dialog */}
      <div className="relative z-10 w-full max-w-4xl bg-[#121213] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Trailer & Teaser Videos — {movie.title}
              </h2>
              <p className="text-[11px] text-text-muted">
                Manage YouTube video references for customer trailers, teasers, and preview playback.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">
                {videos.length} Registered Videos
              </span>
              <span className="text-xs text-text-muted">
                ({videos.filter((v) => v.isActive !== false).length} Active)
              </span>
            </div>

            {!isAdding && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-gold/10 transition-all border-0"
              >
                <Plus className="w-4 h-4" />
                Add Trailer / Teaser
              </button>
            )}
          </div>

          {/* Add / Edit Video Form */}
          {isAdding && (
            <form
              onSubmit={handleSaveVideoItem}
              className="bg-[#18181b] border border-gold/30 p-5 rounded-2xl space-y-4 animate-slideDown"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  {editingVideoId ? 'Edit Video Reference' : 'Add New Trailer / Teaser'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-text-muted hover:text-white cursor-pointer bg-transparent border-0"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* YouTube URL Input */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">
                    YouTube URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-xs text-white placeholder:text-text-muted font-mono focus:outline-none"
                  />
                  {validationError && (
                    <div className="flex items-center gap-1.5 text-rose-400 text-[11px] pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}
                  {extractedVideoId && !validationError && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Normalized YouTube Video ID: <strong className="font-mono">{extractedVideoId}</strong></span>
                    </div>
                  )}
                </div>

                {/* Live Embedded Preview Box */}
                {extractedVideoId && (
                  <div className="md:col-span-2 bg-black/40 border border-white/10 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                      Live Admin Preview (No Autoplay)
                    </span>
                    <div className="relative aspect-video max-w-md mx-auto rounded-lg overflow-hidden border border-white/10 bg-black">
                      <iframe
                        src={buildSafeYouTubeEmbedUrl(extractedVideoId, { autoplay: false })}
                        title="Admin Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                )}

                {/* Video Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">
                    Video Type <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(['TRAILER', 'TEASER'] as VideoType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVideoType(type)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border cursor-pointer ${
                          videoType === type
                            ? 'bg-gold/20 text-gold border-gold'
                            : 'bg-black/40 text-text-secondary border-white/10 hover:border-white/20'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">
                    Video Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Theatrical Trailer"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-xs text-white placeholder:text-text-muted focus:outline-none"
                  />
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">
                    Language
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telugu, Hindi, English"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-black/50 border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-gold focus:ring-gold h-4 w-4"
                    />
                    <span>Active (Display on customer movie details page)</span>
                  </label>
                </div>
              </div>

              {/* Form Submission Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!extractedVideoId || !!validationError}
                  className="px-6 py-2 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-gold/20 border-0"
                >
                  {editingVideoId ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </form>
          )}

          {/* Video List Table */}
          {videos.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2">
              <Film className="w-8 h-8 text-gold/60 mx-auto" />
              <p className="text-sm font-bold text-white">No Trailers or Teasers Added Yet</p>
              <p className="text-xs text-text-muted">
                Add YouTube trailer or teaser links to showcase them on the CineVenue customer page.
              </p>
            </div>
          ) : (
            <div className="bg-[#121213] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-black/40 text-text-secondary border-b border-white/10">
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold">Order</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold">Preview</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold">Type</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold">Title</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold">Language</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold">Status</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {videos.map((video, idx) => (
                      <tr key={video.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Reorder Buttons & Display Order */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-gold">{video.displayOrder || idx + 1}</span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleReorder(idx, 'up')}
                                disabled={idx === 0}
                                className="p-0.5 text-text-muted hover:text-white disabled:opacity-20 cursor-pointer bg-transparent border-0"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleReorder(idx, 'down')}
                                disabled={idx === videos.length - 1}
                                className="p-0.5 text-text-muted hover:text-white disabled:opacity-20 cursor-pointer bg-transparent border-0"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setPreviewingVideo(video)}
                            className="relative w-20 aspect-video rounded overflow-hidden bg-black/60 border border-white/10 cursor-pointer group shrink-0"
                          >
                            <img
                              src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 text-gold fill-gold" />
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              video.type === 'TRAILER'
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {video.type}
                          </span>
                        </td>

                        {/* Title & Video ID */}
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-white block">{video.title}</span>
                            <span className="text-[10px] font-mono text-text-muted">
                              ID: {video.youtubeVideoId}
                            </span>
                          </div>
                        </td>

                        {/* Language */}
                        <td className="py-3 px-4 text-text-secondary">
                          {video.language || 'Default'}
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(video.id)}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all border ${
                              video.isActive !== false
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {video.isActive !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setPreviewingVideo(video)}
                            title="Preview Video"
                            className="p-1.5 text-gold hover:bg-gold/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(video)}
                            title="Edit Video"
                            className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            title="Delete Video"
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-black/60 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors border-0"
          >
            Close Video Manager
          </button>
        </div>
      </div>

      {/* Embedded Player for live preview */}
      <YouTubePlayerModal
        isOpen={!!previewingVideo}
        video={previewingVideo}
        movieTitle={movie.title}
        onClose={() => setPreviewingVideo(null)}
      />
    </div>
  );
}
