import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  useGetAllMediaQuery,
  useCreateMediaMutation,
  useDeleteMediaMutation,
} from '../../features/APIS/mediaApi';
import { eventApi } from '../../features/APIS/EventsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../App/store';

interface Event {
  eventId: number;
  title: string;
}

interface Media {
  mediaId: number;
  eventId: number;
  type: 'image' | 'video';
  url: string;
  uploadedAt: string;
  altText?: string;
}

const AllMedia: React.FC = () => {
  const { data: mediaList, isLoading, isError } = useGetAllMediaQuery(undefined);
  const { data: events = [] } = eventApi.useGetAllEventsQuery({});
  const [createMedia, { isLoading: isCreating }] = useCreateMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets';

  const [eventId, setEventId] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firstName = useSelector((state:RootState)=>state.auth.user.firstName)

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !eventId || !type) {
      Swal.fire('Missing Info', 'Please provide all required fields.', 'warning');
      return;
    }

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', preset_key);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/${type}/upload`,
        cloudFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percent);
          },
        }
      );

      const url = response.data.secure_url;

      await createMedia({
        eventId: Number(eventId),
        type,
        url,
      }).unwrap();

      setEventId('');
      setType('image');
      setFile(null);
      setUploadProgress(0);
      setIsModalOpen(false);

      Swal.fire('Success', 'Media uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to upload media.', 'error');
    }
  };

  const handleDelete = async (mediaId: number) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This media will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteMedia(mediaId).unwrap();
        Swal.fire('Deleted!', 'Media has been deleted.', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete media.', 'error');
      }
    }
  };

  const getEventName = (id: number): string => {
    const match = events.find((event: Event) => event.eventId === id);
    return match?.title || `Event ${id}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} @ ${timePart}`;
  };

  return (
    <div className="min-h-screen p-6 bg-base-100 text-base-content">
       <div className="mb-6 text-xl sm:text-2xl font-semibold text-primary">
        👋 Hey {firstName}, welcome!
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">📸 All Media</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-success flex items-center gap-2"
        >
          <Plus size={18} />
          Add Media
        </button>
      </div>

      {isLoading ? (
        <p className="text-info">Loading media...</p>
      ) : isError ? (
        <p className="text-error">❌ Failed to load media.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaList?.map((media: Media) => (
            <div
              key={media.mediaId}
              className="bg-base-200 border border-base-300 rounded-xl shadow p-4"
            >
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={media.altText || 'Media'}
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <video controls className="w-full h-48 rounded">
                  <source src={media.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <div className="mt-3 text-sm space-y-1">
                <p>
                  <span className="font-semibold text-base-content">📽️ Type:</span>{' '}
                  <span className="capitalize text-warning">{media.type}</span>
                </p>
                <p>
                  <span className="font-semibold text-base-content">🎟️ Event:</span>{' '}
                  <span className="text-info">{getEventName(media.eventId)}</span>
                </p>
                <p>
                  <span className="font-semibold text-base-content">⏰ Uploaded:</span>{' '}
                  <span className="text-sm text-base-content/70">{formatDate(media.uploadedAt)}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button className="btn btn-warning btn-sm" title="Edit (Not implemented)">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(media.mediaId)}
                  className="btn btn-error btn-sm"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-base-200 border border-base-300 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-3 text-error hover:scale-110 transition"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4 text-primary">Upload New Media</h3>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Event</option>
                {events.map((event: Event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.title}
                  </option>
                ))}
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'image' | 'video')}
                className="select select-bordered w-full"
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              <input
                type="file"
                accept={type === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered w-full"
                required
              />

              {uploadProgress > 0 && (
                <progress
                  className="progress progress-info w-full"
                  value={uploadProgress}
                  max={100}
                >
                  {uploadProgress}%
                </progress>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="btn btn-primary w-full"
              >
                {isCreating ? 'Uploading...' : 'Upload Media'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMedia;
