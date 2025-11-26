import React, { useState, useEffect } from 'react';
import {
  Video,
  MessageSquare,
  Edit3,
  Trash2,
  Save,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const API_URL = 'https://youtubecampaniondashboard.onrender.com';

export default function YouTubeDashboard() {
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]); // always an array
  const [notes, setNotes] = useState([]);       // always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit states
  const [editingVideo, setEditingVideo] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Comment states
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Note states
  const [newNote, setNewNote] = useState('');

  // ──────────────────────────────────────────────────────────────
  // Fetch functions (with safety)
  // ──────────────────────────────────────────────────────────────
  const fetchVideoDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/video`);
      if (!res.ok) throw new Error('Failed to load video');
      const data = await res.json();
      setVideo(data);
      setEditTitle(data.title || '');
      setEditDescription(data.description || '');
    } catch (err) {
      console.error(err);
      setError('Could not load video details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/comments`);
      if (!res.ok) throw new Error('Comments endpoint error');
      const data = await res.json();
      // Force array even if backend returns { error: ... }
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Comments error:', err);
      setError('Failed to load comments – check your refresh token');
      setComments([]);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/notes`);
      if (!res.ok) throw new Error('Notes endpoint error');
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setNotes([]);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // CRUD operations
  // ──────────────────────────────────────────────────────────────
  const updateVideo = async () => {
    try {
      await fetch(`${API_URL}/video`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      setEditingVideo(false);
      fetchVideoDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // const addComment = async () => {
  //   if (!newComment.trim()) return;
  //   await fetch(`${API_URL}/comments`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ text: newComment }),
  //   });
  //   setNewComment('');
  //   fetchComments();
  // };

  const addComment = async () => {
  if (!newComment.trim()) return;
  
  try {
    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment }),
    });
    
    // Check if request was successful
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to post comment');
    }
    
    const result = await res.json();
    console.log('Comment posted:', result); // Debug log
    
    setNewComment('');
    await fetchComments(); // Wait for refresh
    
  } catch (err) {
    console.error('Error posting comment:', err);
    setError(`Failed to post comment: ${err.message}`);
  }
};

  const replyToComment = async (commentId) => {
    if (!replyText.trim()) return;
    await fetch(`${API_URL}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: replyText }),
    });
    setReplyTo(null);
    setReplyText('');
    fetchComments();
  };

  const deleteComment = async (commentId) => {
    await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE' });
    fetchComments();
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote('');
    fetchNotes();
  };

  const deleteNote = async (noteId) => {
    await fetch(`${API_URL}/notes/${noteId}`, { method: 'DELETE' });
    fetchNotes();
  };

  // ──────────────────────────────────────────────────────────────
  // Load data
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchVideoDetails();
    fetchComments();
    fetchNotes();
  }, []);

  // Refresh comments/notes when switching tabs
  useEffect(() => {
    if (activeTab === 'comments') fetchComments();
    if (activeTab === 'notes') fetchNotes();
  }, [activeTab]);

  // ──────────────────────────────────────────────────────────────
  // Initial loading screen
  // ──────────────────────────────────────────────────────────────
  if (loading && !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">YouTube Companion</h1>
                <p className="text-gray-500">Manage your video with ease</p>
              </div>
            </div>
            <button
              onClick={() => {
                fetchVideoDetails();
                fetchComments();
                fetchNotes();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            {['overview', 'comments', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition ${
                  activeTab === tab
                    ? 'border-b-2 border-red-500 text-red-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview */}
            {activeTab === 'overview' && video && (
              <div className="space-y-6">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingVideo ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-2xl font-bold border-b-2 border-red-500 focus:outline-none"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-800">{video.title}</h2>
                      )}
                    </div>
                    {!editingVideo ? (
                      <button
                        onClick={() => setEditingVideo(true)}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit3 className="w-5 h-5 text-gray-600" />
                      </button>
                    ) : (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={updateVideo}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideo(false);
                            setEditTitle(video.title);
                            setEditDescription(video.description);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {editingVideo ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full p-3 border-2 border-red-500 rounded-lg focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">{video.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{video.viewCount || 0}</p>
                      <p className="text-sm text-gray-500">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{video.likeCount || 0}</p>
                      <p className="text-sm text-gray-500">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{video.commentCount || 0}</p>
                      <p className="text-sm text-gray-500">Comments</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                {/* Add comment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={addComment}
                    className="mt-3 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>

                {/* Comments list or empty state */}
                {comments.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No comments yet</p>
                    <p className="text-gray-500 mt-2">
                      {error
                        ? 'Comments failed to load – your refresh token is probably invalid.'
                        : 'Your video has no comments.'}
                    </p>
                    {error && (
                      <button
                        onClick={fetchComments}
                        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {comment.authorDisplayName || 'Unknown'}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {comment.textDisplay || comment.snippet?.textDisplay || ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setReplyTo(comment.id)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition"
                            >
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                            </button>
                            {comment.canDelete && (
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reply box */}
                        {replyTo === comment.id && (
                          <div className="mt-4 pl-6 border-l-2 border-gray-300">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              rows={2}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => replyToComment(comment.id)}
                                className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => {
                                  setReplyTo(null);
                                  setReplyText('');
                                }}
                                className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Existing replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-6 border-l-2 border-gray-300 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-white rounded-lg p-3">
                                <p className="font-semibold text-sm text-gray-800">
                                  {reply.authorDisplayName}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  {reply.textDisplay}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add ideas for improving your video..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={addNote}
                    className="mt-3 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Note
                  </button>
                </div>

                {notes.length === 0 ? (
                  <div className="text-center py-16">
                    <Edit3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No notes yet</p>
                    <p className="text-gray-500 mt-2">Start jotting down ideas!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map((note) => (
                      <div
                        key={note._id || note.id}
                        className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 shadow"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-gray-800 flex-1">{note.content}</p>
                          <button
                            onClick={() => deleteNote(note._id || note.id)}
                            className="ml-2 p-1 hover:bg-yellow-200 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}