import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Play, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { config } from '../../config';

const SyllabusManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [editVideoId, setEditVideoId] = useState(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTitle, setImageTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [pdfs, setPdfs] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0]);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchVideos();
      fetchImages();
      fetchPdfs();
    }
  }, [selectedCategory]);

  const fetchVideos = () => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories/${selectedCategory.id}/videos`)
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error(err));
  };

  const fetchImages = () => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories/${selectedCategory.id}/images`)
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
  };

  const fetchPdfs = () => {
    fetch(`${config.API_BASE_URL}/api/syllabus/categories/${selectedCategory.id}/pdfs`)
      .then(res => res.json())
      .then(data => setPdfs(data))
      .catch(err => console.error(err));
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!editVideoId && !videoFile) return alert("Video file is required");
    if (!title) return alert("Title is required");
    
    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('duration', duration);
    formData.append('category_id', selectedCategory.id);
    formData.append('categorySlug', selectedCategory.slug);
    if (videoFile) formData.append('video', videoFile);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

    try {
      const url = editVideoId 
        ? `${config.API_BASE_URL}/api/syllabus/videos/${editVideoId}` 
        : `${config.API_BASE_URL}/api/syllabus/videos`;
      const method = editVideoId ? 'put' : 'post';

      // Use axios instead of fetch to track upload progress
      const { default: axios } = await import('axios');
      const res = await axios({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      if (res.status === 200 || res.status === 201) {
        setTitle('');
        setDescription('');
        setDuration('');
        setVideoFile(null);
        setThumbnailFile(null);
        setEditVideoId(null);
        setShowUploadModal(false);
        setUploadProgress(0);
        fetchVideos();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error during upload.");
    }
    setLoading(false);
  };

  const handleEditClick = (video) => {
    setTitle(video.title);
    setDescription(video.description || '');
    setDuration(video.duration || '');
    setEditVideoId(video.id);
    setShowUploadModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/syllabus/videos/${id}`, { method: 'DELETE' });
        if (res.ok) fetchVideos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Image file is required");
    
    setImageLoading(true);
    const formData = new FormData();
    formData.append('title', imageTitle);
    formData.append('category_id', selectedCategory.id);
    formData.append('categorySlug', selectedCategory.slug);
    formData.append('image', imageFile);

    try {
      const res = await fetch(`${config.API_BASE_URL}/api/syllabus/images`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setImageTitle('');
        setImageFile(null);
        setShowImageModal(false);
        fetchImages();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
    }
    setImageLoading(false);
  };

  const handleImageDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/syllabus/images/${id}`, { method: 'DELETE' });
        if (res.ok) fetchImages();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("PDF file is required");
    
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('title', pdfTitle);
    formData.append('category_id', selectedCategory.id);
    formData.append('categorySlug', selectedCategory.slug);
    formData.append('pdf', pdfFile);

    try {
      const { default: axios } = await import('axios');
      const res = await axios.post(`${config.API_BASE_URL}/api/syllabus/pdfs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        setPdfTitle('');
        setPdfFile(null);
        setShowPdfModal(false);
        fetchPdfs();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
    }
    setPdfLoading(false);
  };

  const handlePdfDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this PDF?")) {
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/syllabus/pdfs/${id}`, { method: 'DELETE' });
        if (res.ok) fetchPdfs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[70vh]">
      {/* Categories Sidebar */}
      <div className="w-full md:w-72 bg-slate-900 border border-indigo-900/50 rounded-2xl p-4 overflow-y-auto max-h-[80vh] shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-indigo-900/50 pb-4 pl-2">Syllabus Categories</h3>
        <div className="flex flex-col gap-1.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory?.id === cat.id ? 'bg-amber-500 text-slate-950 shadow-lg scale-[1.02]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {selectedCategory && (
          <>
            {/* Header and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1"><span className="text-amber-500">{selectedCategory.name}</span></h3>
                <p className="text-slate-400 text-sm">{selectedCategory.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowPdfModal(true)}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm whitespace-nowrap py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:-translate-y-1"
                >
                  <FileText className="w-4 h-4" /> Add PDF
                </button>
                <button 
                  onClick={() => setShowImageModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm whitespace-nowrap py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:-translate-y-1"
                >
                  <ImageIcon className="w-4 h-4" /> Add Images
                </button>
                <button 
                  onClick={() => {
                    setTitle('');
                    setDescription('');
                    setDuration('');
                    setVideoFile(null);
                    setThumbnailFile(null);
                    setEditVideoId(null);
                    setShowUploadModal(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm whitespace-nowrap py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:-translate-y-1"
                >
                  <Upload className="w-4 h-4" /> Add New Video
                </button>
              </div>
            </div>

            {/* Video Grid */}
            <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-8 flex-1 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-indigo-900/50 pb-4">Uploaded Videos ({videos.length})</h3>
              
              {videos.length === 0 ? (
                <div className="text-slate-500 text-center py-16 bg-slate-950/50 rounded-xl border border-dashed border-indigo-900/30">
                  <Video className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                  No videos uploaded for this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => (
                    <div key={video.id} className="bg-slate-950 border border-indigo-900/50 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-colors shadow-lg">
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-black flex-shrink-0 w-full overflow-hidden">
                        {video.thumbnail_url ? (
                           <img src={`${config.API_BASE_URL}${video.thumbnail_url}`} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <video src={`${config.API_BASE_URL}${video.video_url}`} className="w-full h-full object-cover opacity-50"></video>
                        )}
                        <div className="absolute bottom-3 right-3 bg-black/70 rounded-full p-2.5 backdrop-blur-sm">
                           <Play className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="text-lg font-bold text-white mb-2 leading-tight">{video.title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1">{video.description}</p>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-indigo-900/50 pt-4">
                          <span className="text-sm font-medium text-slate-300">{video.duration || 'N/A'}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(video)} className="p-2 bg-slate-800 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(video.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Images Grid */}
            <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-8 flex-1 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-indigo-900/50 pb-4">Uploaded Images ({images.length})</h3>
              
              {images.length === 0 ? (
                <div className="text-slate-500 text-center py-16 bg-slate-950/50 rounded-xl border border-dashed border-indigo-900/30">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                  No images uploaded for this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {images.map(image => (
                    <div key={image.id} className="bg-slate-950 border border-indigo-900/50 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-colors shadow-lg">
                      <div className="relative h-48 bg-black flex-shrink-0 w-full overflow-hidden">
                        <img src={`${config.API_BASE_URL}${image.image_url}`} alt={image.title || "Category image"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="text-md font-bold text-white mb-2 leading-tight truncate">{image.title || 'Untitled Image'}</h4>
                        
                        <div className="mt-auto flex items-center justify-end border-t border-indigo-900/50 pt-3">
                          <button onClick={() => handleImageDelete(image.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDFs Grid */}
            <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-8 flex-1 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-indigo-900/50 pb-4">Uploaded PDFs ({pdfs.length})</h3>
              
              {pdfs.length === 0 ? (
                <div className="text-slate-500 text-center py-16 bg-slate-950/50 rounded-xl border border-dashed border-indigo-900/30">
                  <FileText className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                  No PDFs uploaded for this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pdfs.map(pdf => (
                    <div key={pdf.id} className="bg-slate-950 border border-indigo-900/50 rounded-2xl p-6 hover:border-green-500/50 transition-colors shadow-lg flex flex-col group">
                      <div className="w-12 h-12 bg-indigo-950 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-green-500" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 leading-tight">{pdf.title || 'Untitled PDF'}</h4>
                      <p className="text-sm text-slate-400 flex-1 mb-4 truncate">{pdf.pdf_url.split('/').pop()}</p>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-indigo-900/50 pt-4">
                         <a href={`${config.API_BASE_URL}${pdf.pdf_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 font-bold">View PDF</a>
                         <button onClick={() => handlePdfDelete(pdf.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Upload Modal */}
            {showUploadModal && (
              <div 
                className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setShowUploadModal(false)}
              >
                <div 
                  className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl w-full max-w-3xl relative mt-10 sm:mt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[#E41E5D] bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors z-10"
                    aria-label="Close modal"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  
                  <h3 className="text-xl font-bold text-white mb-6 pr-10">{editVideoId ? 'Edit Video in' : 'Upload to'}: <span className="text-amber-500">{selectedCategory.name}</span></h3>
                  
                  <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-slate-300 text-sm font-bold mb-1.5">Video Title *</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors" placeholder="e.g. The Magician Card Meaning" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-slate-300 text-sm font-bold mb-1.5">Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors" placeholder="Brief description of the video content..."></textarea>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-slate-300 text-sm font-bold mb-1.5">Duration (optional)</label>
                      <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors" placeholder="e.g. 15 min" />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <div className="border-2 border-dashed border-indigo-900/50 hover:border-amber-500/50 transition-colors rounded-xl p-4 bg-slate-950/50 flex flex-col items-center justify-center text-center group">
                        <Play className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                        <label className="cursor-pointer text-amber-400 hover:text-amber-300 font-bold text-sm px-4 py-2 bg-amber-500/10 rounded-lg">
                          {editVideoId ? 'Update Video File (Optional)' : 'Select Video File *'}
                          <input type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
                        </label>
                        {videoFile && <span className="text-xs text-slate-400 mt-3 truncate max-w-full px-2 font-mono bg-slate-900 p-1.5 rounded">{videoFile.name}</span>}
                      </div>
                      
                      <div className="border-2 border-dashed border-indigo-900/50 hover:border-indigo-500/50 transition-colors rounded-xl p-4 bg-slate-950/50 flex flex-col items-center justify-center text-center group">
                        <ImageIcon className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                        <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-bold text-sm px-4 py-2 bg-indigo-500/10 rounded-lg">
                          Select Thumbnail (Optional)
                          <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnailFile(e.target.files[0])} />
                        </label>
                        {thumbnailFile && <span className="text-xs text-slate-400 mt-3 truncate max-w-full px-2 font-mono bg-slate-900 p-1.5 rounded">{thumbnailFile.name}</span>}
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex justify-end mt-4 gap-3 border-t border-indigo-900/50 pt-4">
                      <button type="button" onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-[#E41E5D] font-bold py-2.5 px-6 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:hover:scale-100 hover:-translate-y-1">
                        {loading ? (editVideoId ? `Updating... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`) : <><Upload className="w-5 h-5" /> {editVideoId ? 'Update Video' : 'Upload Video'}</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Image Upload Modal */}
            {showImageModal && (
              <div 
                className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setShowImageModal(false)}
              >
                <div 
                  className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl relative mt-10 sm:mt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowImageModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[#E41E5D] bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors z-10"
                    aria-label="Close modal"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  
                  <h3 className="text-xl font-bold text-white mb-6 pr-10">Add Image to: <span className="text-indigo-400">{selectedCategory.name}</span></h3>
                  
                  <form onSubmit={handleImageUpload} className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-bold mb-1.5">Image Title (Optional)</label>
                      <input type="text" value={imageTitle} onChange={e => setImageTitle(e.target.value)} className="w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors" placeholder="e.g. Card Spread Diagram" />
                    </div>
                    
                    <div className="border-2 border-dashed border-indigo-900/50 hover:border-indigo-500/50 transition-colors rounded-xl p-6 bg-slate-950/50 flex flex-col items-center justify-center text-center group mt-2">
                      <ImageIcon className="w-10 h-10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                      <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-bold text-sm px-4 py-2 bg-indigo-500/10 rounded-lg">
                        Select Image File *
                        <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} required />
                      </label>
                      {imageFile && <span className="text-xs text-slate-400 mt-3 truncate max-w-full px-2 font-mono bg-slate-900 p-1.5 rounded">{imageFile.name}</span>}
                    </div>
                    
                    <div className="flex justify-end mt-4 gap-3 border-t border-indigo-900/50 pt-4">
                      <button type="button" onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-[#E41E5D] font-bold py-2.5 px-6 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={imageLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:hover:scale-100 hover:-translate-y-1">
                        {imageLoading ? 'Uploading...' : <><Upload className="w-5 h-5" /> Upload Image</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* PDF Upload Modal */}
            {showPdfModal && (
              <div 
                className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setShowPdfModal(false)}
              >
                <div 
                  className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl w-full max-w-xl relative mt-10 sm:mt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowPdfModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[#E41E5D] bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors z-10"
                    aria-label="Close modal"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  
                  <h3 className="text-xl font-bold text-white mb-6 pr-10">Add PDF to: <span className="text-green-400">{selectedCategory.name}</span></h3>
                  
                  <form onSubmit={handlePdfUpload} className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-bold mb-1.5">PDF Title (Optional)</label>
                      <input type="text" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} className="w-full bg-slate-950 text-white rounded-xl p-3 border border-indigo-900/50 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors" placeholder="e.g. Reference Guide" />
                    </div>
                    
                    <div className="border-2 border-dashed border-indigo-900/50 hover:border-green-500/50 transition-colors rounded-xl p-6 bg-slate-950/50 flex flex-col items-center justify-center text-center group mt-2">
                      <FileText className="w-10 h-10 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                      <label className="cursor-pointer text-green-400 hover:text-green-300 font-bold text-sm px-4 py-2 bg-green-500/10 rounded-lg">
                        Select PDF File *
                        <input type="file" accept="application/pdf" className="hidden" onChange={e => setPdfFile(e.target.files[0])} required />
                      </label>
                      {pdfFile && <span className="text-xs text-slate-400 mt-3 truncate max-w-full px-2 font-mono bg-slate-900 p-1.5 rounded">{pdfFile.name}</span>}
                    </div>
                    
                    <div className="flex justify-end mt-4 gap-3 border-t border-indigo-900/50 pt-4">
                      <button type="button" onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-[#E41E5D] font-bold py-2.5 px-6 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={pdfLoading} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:hover:scale-100 hover:-translate-y-1">
                        {pdfLoading ? 'Uploading...' : <><Upload className="w-5 h-5" /> Upload PDF</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SyllabusManagement;
