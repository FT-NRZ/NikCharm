'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export default function ProductComments({ productId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    rating: 5,
    comment: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/${productId}`);
        const data = await res.json();
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      }
    };
    fetchComments();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/comments/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // مقدار تستی، باید مقدار واقعی کاربر لاگین‌شده باشد
          comment: newComment.comment,
          rating: parseInt(newComment.rating),
        }),
      });

      const result = await res.json();
      if (res.ok && result.comment) {
        setComments((prev) => [result.comment, ...prev]);
        setNewComment({ rating: 5, comment: '' });
        setShowForm(false);
        setSuccessMessage('نظر شما با موفقیت ثبت شد!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setSuccessMessage(result.error || 'خطا در ثبت نظر');
      }
    } catch (error) {
      setSuccessMessage('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="w-90 mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[420px] flex flex-col relative">
      <h3 className="text-xl font-semibold mb-6">نظرات مشتریان ({comments.length})</h3>

      {/* Comments List */}
      <div className={`space-y-6 mb-4 flex-1 overflow-y-auto ${showForm ? 'invisible' : 'visible'}`}>
        {comments.length === 0 ? (
          <div className="text-gray-500">نظری ثبت نشده است.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="border-b pb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center">
                  {comment.users?.full_name?.charAt(0) || 'ک'}
                </div>
                <div>
                  <h4 className="font-medium">{comment.users?.full_name || `کاربر ${comment.user_id}`}</h4>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(comment.stars || 0)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{comment.text}</p>
              <time className="text-sm text-gray-500">
                {comment.date && new Date(comment.date).toLocaleDateString()}
              </time>
            </div>
          ))
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 text-green-600 bg-green-100 p-2 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Initial Text Box */}
      {!showForm && (
        <div
          className="p-4 border rounded-lg text-gray-500 cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => setShowForm(true)}
        >
          خوشحال می‌شم نظرت رو درباره محصول بگی...
        </div>
      )}

      {/* Comment Form */}
      {showForm && (
        <form 
          onSubmit={handleSubmit} 
          className="absolute top-3 left-0 w-full h-full bg-white p-4 rounded-xl shadow-lg z-50 flex flex-col"
        >
          <div className="mb-3">
            <label className="block mb-1 text-sm">امتیاز:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <Star
                  key={num}
                  className={`w-5 h-5 cursor-pointer ${
                    newComment.rating >= num ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  onClick={() => setNewComment({ ...newComment, rating: num })}
                />
              ))}
            </div>
          </div>
          <textarea
            placeholder="نظر شما درباره محصول..."
            className="w-full p-2 border rounded-lg h-24 text-sm mb-3"
            value={newComment.comment}
            onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
            required
          />

          <div className="flex gap-2 mt-auto">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              ثبت نظر
            </button>
          </div>
        </form>
      )}
    </div>
  );
}