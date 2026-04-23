import { useState, useEffect } from 'react';

function EditBookmarkModal({ isOpen, onClose, onSave, onDelete, onClone, bookmark }) {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        icon: '',
        theme: ''
    });

    useEffect(() => {
        if (bookmark) {
            setFormData({
                name: bookmark.Name || '',
                url: bookmark.Href || '',
                icon: bookmark.Icon || '',
                theme: bookmark.Theme || ''
            });
        }
    }, [bookmark]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    const handleClone = () => {
        onClone(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Bookmark</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="url" className="form-label">URL</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    id="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="icon" className="form-label">Icon (FontAwesome class)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="icon"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    placeholder="e.g. fa-solid fa-home"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="theme" className="form-label">Theme/Color</label>
                                <select
                                    className="form-select"
                                    id="theme"
                                    name="theme"
                                    value={formData.theme}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a color...</option>
                                    <option value="red">Red</option>
                                    <option value="blue">Blue</option>
                                    <option value="green">Green</option>
                                    <option value="orange">Orange</option>
                                    <option value="purple">Purple</option>
                                    <option value="pink">Pink</option>
                                    <option value="cyan">Cyan</option>
                                    <option value="yellow">Yellow</option>
                                    <option value="darkred">Dark Red</option>
                                    <option value="lightgrey">Light Grey</option>
                                    <option value="azureblue">Azure Blue</option>
                                    <option value="lightgreen">Light Green</option>
                                </select>
                                <div className="form-text">Or enter a custom hex color like #ff5733</div>
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    name="theme"
                                    value={formData.theme}
                                    onChange={handleChange}
                                    placeholder="#ff5733"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger me-auto" onClick={handleDelete}>
                                Delete
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleClone}>
                                Clone
                            </button>
                            <button type="submit" className="btn btn-primary">
                                OK
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditBookmarkModal;
