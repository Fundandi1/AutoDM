import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Engagement = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [comment, setComment] = useState('');
  const [schedule, setSchedule] = useState('now');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/api/instagram_accounts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAccounts(response.data);
        if (response.data.length > 0) {
          setSelectedAccount(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts. Please try again later.');
      }
    };

    fetchAccounts();
  }, [token]);

  const handleFetchPosts = async () => {
    if (!selectedAccount) {
      setError('Please select an account first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/engagement/posts', {
        headers: { Authorization: `Bearer ${token}` },
        params: { account_id: selectedAccount }
      });
      
      // Transform API response to match component state format
      const formattedPosts = response.data.map(post => ({
        id: post.id,
        username: post.username,
        imageUrl: post.image_url,
        caption: post.caption,
        likes: post.likes,
        hasLiked: post.has_liked,
        comments: post.comments,
        timestamp: post.timestamp
      }));
      
      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      // Optimistically update UI
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, hasLiked: !post.hasLiked, likes: post.hasLiked ? post.likes - 1 : post.likes + 1 } 
          : post
      ));
      
      // Call API to perform the actual like/unlike
      const response = await axios.post('/api/engagement/like', {
        post_id: postId,
        account_id: selectedAccount,
        unlike: post.hasLiked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show success toast or message (could replace alert with a nicer UI notification)
      console.log(response.data.message);
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post. Please try again later.');
      
      // Revert optimistic update if API call fails
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, hasLiked: !post.hasLiked, likes: !post.hasLiked ? post.likes - 1 : post.likes + 1 } 
          : post
      ));
    }
  };

  const handleComment = async (postId) => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      // Optimistically update UI
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 } 
          : post
      ));
      
      // Prepare data for API call
      const commentData = {
        post_id: postId,
        account_id: selectedAccount,
        comment: comment,
        schedule_time: schedule === 'schedule' ? scheduledTime : null
      };
      
      // Call API to post or schedule comment
      const response = await axios.post('/api/engagement/comment', commentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show success message
      alert(response.data.message);
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again later.');
      
      // Revert optimistic update if API call fails
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments - 1 } 
          : post
      ));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Instagram Engagement</h2>
        <p className="text-gray-600 mb-4">
          Like and comment on posts to increase your engagement and visibility.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Instagram Account
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">Select an account</option>
            {accounts.map(account => (
              <option key={account._id} value={account._id}>
                {account.username}
              </option>
            ))}
          </select>
        </div>
        
        <button
          className="w-full bg-primary-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={handleFetchPosts}
          disabled={!selectedAccount}
        >
          Find Posts to Engage With
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{post.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <img 
                  src={post.imageUrl} 
                  alt={post.caption} 
                  className="w-full h-64 object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center text-gray-600 hover:text-red-500"
                    >
                      {post.hasLiked ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6" />
                      )}
                      <span className="ml-1 text-sm">{post.likes}</span>
                    </button>
                    <div className="flex items-center text-gray-600">
                      <ChatBubbleLeftRightIcon className="h-6 w-6" />
                      <span className="ml-1 text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-800 mb-4">{post.caption}</p>
                
                <div className="border-t pt-4">
                  <div className="flex flex-col space-y-3">
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Add a comment..."
                      rows="2"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    
                    <div className="flex items-center">
                      <div className="flex-1">
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={schedule}
                          onChange={(e) => setSchedule(e.target.value)}
                        >
                          <option value="now">Post now</option>
                          <option value="schedule">Schedule</option>
                        </select>
                      </div>
                      
                      {schedule === 'schedule' && (
                        <div className="ml-2 flex-1">
                          <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                          />
                        </div>
                      )}
                      
                      <button
                        className="ml-2 bg-primary-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => handleComment(post.id)}
                      >
                        {schedule === 'now' ? 'Post' : 'Schedule'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && !loading && (
            <div className="text-center py-10 bg-white shadow rounded-lg">
              <p className="text-gray-500">No posts to display. Select an account and click "Find Posts" to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Engagement; 