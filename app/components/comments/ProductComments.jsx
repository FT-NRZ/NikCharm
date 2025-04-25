'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export default function ProductComments({ productId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
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
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/comments/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          rating: parseInt(newComment.rating),
        }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [savedComment, ...prev]);
        setNewComment({ name: '', email: '', rating: 5, comment: '' });
        setShowForm(false);
        setSuccessMessage('نظر شما با موفقیت ثبت شد!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await res.json();
        setSuccessMessage(errorData.error || 'خطا در ثبت نظر');
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
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center">
                {comment.name[0]}
              </div>
              <div>
                <h4 className="font-medium">{comment.name}</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(comment.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700">{comment.comment}</p>
            <time className="text-sm text-gray-500">
              {new Date(comment.date).toLocaleDateString('fa-IR')}
            </time>
          </div>
        ))}
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
          <div className="grid grid-cols-2 gap-3 mb-3">
          <label className=" mb-1 text-sm">نام:</label>
            <input
              type="text"
              placeholder="نام شما"
              className="p-2 border rounded-lg text-sm"
              value={newComment.name}
              onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
              required
            />
            <label className=" mb-1 text-sm">ایمیل (اختیاری):</label>
            <input
              type="email"
              placeholder="ایمیل (اختیاری)"
              className="p-2 border rounded-lg text-sm"
              value={newComment.email}
              onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
            />
          </div>

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