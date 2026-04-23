import ModelCard from './ModelCard';
import EditBookmarkModal from './EditBookmarkModal';
import { useState } from 'react';

function BookmarkGroup({name = '', bookmarks = [], isEditMode = false, onUpdateBookmark, onReorderBookmarks, onDeleteBookmark, onAddBookmark}) {
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const validBookmarks = bookmarks.filter(bookmark =>
        bookmark &&
        typeof bookmark === 'object' &&
        bookmark.Name &&
        bookmark.Href
    );

    if (validBookmarks.length === 0 && !isEditMode) return null;

    const handleEditBookmark = (bookmark, index) => {
        setEditingBookmark(bookmark);
        setEditingIndex(index);
        setShowModal(true);
    };

    const handleSaveBookmark = (updatedBookmark) => {
        if (onUpdateBookmark && editingIndex !== null) {
            onUpdateBookmark(name, editingIndex, updatedBookmark);
        }
        setShowModal(false);
        setEditingBookmark(null);
        setEditingIndex(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBookmark(null);
        setEditingIndex(null);
    };

    const handleDeleteBookmark = () => {
        if (onDeleteBookmark && editingIndex !== null) {
            onDeleteBookmark(name, editingIndex);
        }
        setShowModal(false);
        setEditingBookmark(null);
        setEditingIndex(null);
    };

    const handleCloneBookmark = (bookmarkData) => {
        console.log('Clone button clicked!', bookmarkData);
        console.log('onAddBookmark function exists:', !!onAddBookmark);
        
        if (onAddBookmark) {
            // Add "Copy" to the name to indicate it's a clone
            const clonedBookmark = {
                ...bookmarkData,
                name: `${bookmarkData.name} Copy`
            };
            console.log('Calling onAddBookmark with:', clonedBookmark);
            onAddBookmark(name, clonedBookmark);
        } else {
            console.error('onAddBookmark function is not available');
        }
    };

    const handleDragStart = (e, index) => {
        if (!isEditMode) return;
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragEnd = (e) => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e) => {
        if (!isEditMode || draggedIndex === null) return;
        e.preventDefault(); // This is crucial for allowing drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e, index) => {
        if (!isEditMode || draggedIndex === null) return;
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e) => {
        // Only clear drag over if we're actually leaving the element
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (!isEditMode || draggedIndex === null || draggedIndex === dropIndex) return;
        
        // Use the reorder function from App component
        if (onReorderBookmarks) {
            onReorderBookmarks(name, draggedIndex, dropIndex);
        }
        
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const add = (e) => {        
        e.preventDefault();
        setEditingBookmark({ Name: '', Href: '', Icon: 'fa fa-bookmark', Theme: '#666666' });
        setEditingIndex(validBookmarks.length);
        setShowModal(true);
    };

    return (
        <div className="card-body p2 pe-2">
            <h5 className="card-title">{name}</h5>

            <div className="d-flex flex-wrap">
                {/* Drop zone before first item */}
                {isEditMode && (
                    <div 
                        className={`drop-zone ${dragOverIndex === -1 ? 'drop-zone-active' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedIndex !== null) setDragOverIndex(-1);
                        }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex !== null && onReorderBookmarks) {
                                onReorderBookmarks(name, draggedIndex, 0);
                            }
                            setDraggedIndex(null);
                            setDragOverIndex(null);
                        }}
                    />
                )}

                {validBookmarks.map((bookmark, index) => (
                    <div key={`${name}-${index}`} className="d-flex">
                        {/* Bookmark item */}
                        <div 
                            className={`icon-link d-flex justify-content-center ${
                                isEditMode ? 'draggable-item' : ''
                            } ${draggedIndex === index ? 'dragging' : ''}`}
                            draggable={isEditMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            style={{
                                cursor: isEditMode ? 'move' : 'default',
                                transition: 'all 0.2s ease',
                                ...(draggedIndex === index && { opacity: 0.5 })
                            }}
                        >
                            <ModelCard
                                name={bookmark.Name}
                                url={bookmark.Href}
                                icon={bookmark.Icon}
                                colour={colorMap[bookmark.Theme] || bookmark.Theme || '#666666'}
                                isEditMode={isEditMode}
                                onEdit={(bookmark) => handleEditBookmark(bookmark, index)}
                            />
                        </div>

                        {/* Drop zone after each item */}
                        {isEditMode && (
                            <div 
                                className={`drop-zone ${dragOverIndex === index + 1 ? 'drop-zone-active' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (draggedIndex !== null && draggedIndex !== index && draggedIndex !== index + 1) {
                                        setDragOverIndex(index + 1);
                                    }
                                }}
                                onDragLeave={() => setDragOverIndex(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedIndex !== null && onReorderBookmarks) {
                                        const targetIndex = draggedIndex < index + 1 ? index : index + 1;
                                        onReorderBookmarks(name, draggedIndex, targetIndex);
                                    }
                                    setDraggedIndex(null);
                                    setDragOverIndex(null);
                                }}
                            />
                        )}
                    </div>
                ))}

                {isEditMode && (
                <div>
                    <a className="bookmark d-flex flex-column" href={'#'} onClick={add}>
                        <span className={`bookmark-icon fa fa-plus fa-3x align-self-center text-secondary`}></span>
                        <span className="bookmark-text"> </span>
                    </a>
                </div>)}
            </div>

            <EditBookmarkModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveBookmark}
                onDelete={handleDeleteBookmark}
                onClone={handleCloneBookmark}
                bookmark={editingBookmark}
            />
        </div>
    );
}

// Color mapping for named themes
const colorMap = {
    'red': '#dc3545',
    'blue': '#0d6efd',
    'green': '#198754',
    'orange': '#fd7e14',
    'purple': '#6f42c1',
    'pink': '#d63384',
    'cyan': '#0dcaf0',
    'yellow': '#ffc107',
    'darkred': '#7c0000',
    'lightgrey': '#adb5bd',
    'azureblue': '#007fff',
    'lightgreen': '#90EE90'
};

export default BookmarkGroup;
