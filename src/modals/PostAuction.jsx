import { useState, useRef } from 'react';
import Modal from '../components/Modal';
import { createAuction } from '../api/auctionApi';
import { getUserId } from '../utils/userId';
import './PostAuction.css';

const initialForm = {
  title: '',
  category: '',
  condition: 'Nowy',
  description: '',
  startingPrice: '',
  endDate: '',
};

function PostAuction({ isOpen, onClose, onAuctionCreated }) {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();
  const slotRefs = [useRef(), useRef()];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFiles = (files) => {
    const imgs = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 4 - images.length)
      .map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...imgs].slice(0, 4));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Podaj nazwę przedmiotu.';
    if (!form.category) errs.category = 'Wybierz kategorię.';
    if (!form.description.trim()) errs.description = 'Opisz swój przedmiot.';
    if (!form.startingPrice || parseFloat(form.startingPrice) <= 0) errs.startingPrice = 'Podaj cenę startową.';
    if (!form.endDate) errs.endDate = 'Podaj datę zakończenia.';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      const newAuction = await createAuction(
        {
          title: form.title,
          description: form.description,
          category: form.category,
          condition: form.condition,
          startingPrice: parseFloat(form.startingPrice),
          endDate: new Date(form.endDate),
          images: images.length > 0 ? images : [],
          mainImage: images[0] || null,
          biddersCount: 0,
          seller: { name: 'Ty', initials: 'TY' },
          technique: null,
          deliveryTime: null,
        },
        userId
      );
      setSubmitted(true);
      if (onAuctionCreated) onAuctionCreated(newAuction);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setForm(initialForm);
    setImages([]);
    setSubmitted(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} size="large">
      {submitted ? (
        <div className="post-auction-success animate-scale-in">
          <div className="success-icon">🎉</div>
          <h3>Aukcja opublikowana!</h3>
          <p>Twoja aukcja została dodana. Możesz ją zobaczyć w zakładce Profil.</p>
          <button onClick={handleModalClose}>Wróć do strony głównej</button>
        </div>
      ) : (
        <div className="post-auction">
          <h2 className="post-auction-title">Dodaj nową aukcję</h2>

          <div className="post-auction-body">
            <div>
              <div className="post-auction-section-title">
                <span className="icon">📋</span> Szczegóły aukcji
              </div>

              <div className="form-field">
                <label>Nazwa przedmiotu</label>
                <input
                  className="form-input"
                  name="title"
                  type="text"
                  placeholder="np. Ręcznie robiony wazon ceramiczny"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.title}</p>}
              </div>

              <div className="form-row form-field">
                <div>
                  <label>Kategoria</label>
                  <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                    <option value="">Wybierz kategorię</option>
                    <option value="Fine Art">Sztuka</option>
                    <option value="Experiences">Doświadczenia</option>
                    <option value="Pet Accessories">Akcesoria</option>
                  </select>
                  {errors.category && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.category}</p>}
                </div>
                <div>
                  <label>Stan</label>
                  <select className="form-input" name="condition" value={form.condition} onChange={handleChange}>
                    <option>Nowy</option>
                    <option>Używany — dobry</option>
                    <option>Używany — przeciętny</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Opis produktu</label>
                <textarea
                  className="form-input form-textarea"
                  name="description"
                  placeholder="Opisz historię swojego przedmiotu i jego znaczenie..."
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.description}</p>}
              </div>
            </div>

            <div>
              <div className="post-auction-section-title">
                <span className="icon">🔨</span> Aukcja
              </div>

              <div className="form-field">
                <label>Cena wywoławcza (PLN)</label>
                <div className="form-input-prefix">
                  <span>zł</span>
                  <input
                    type="number"
                    name="startingPrice"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={form.startingPrice}
                    onChange={handleChange}
                  />
                </div>
                {errors.startingPrice && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.startingPrice}</p>}
              </div>

              <div className="form-field">
                <label>Data zakończenia aukcji</label>
                <input
                  className="form-input"
                  name="endDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.endDate}
                  onChange={handleChange}
                />
                {errors.endDate && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.endDate}</p>}
              </div>

              <div className="post-auction-info-box">
                <div className="check">✓</div>
                <p>Wszystkie przedmioty są weryfikowane przez naszych kuratorów w celu zachowania wysokiej jakości.</p>
              </div>

              <button className="publish-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Publikowanie...' : 'Opublikuj'}
              </button>
            </div>
          </div>

          <div className="post-auction-gallery-section">
            <div className="post-auction-gallery-left">
              <div className="post-auction-section-title">
                <span className="icon">🖼️</span> Galeria zdjęć
              </div>

              <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="dropzone-icon">☁️</span>
                <h4>Przeciągnij i upuść zdjęcia tutaj</h4>
                <p>Lub kliknij, aby wybrać z urządzenia (maks. 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              <div className="gallery-slots">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="gallery-slot"
                    onClick={() => slotRefs[i].current?.click()}
                  >
                    {images[i] ? (
                      <img src={images[i]} alt={`Zdjęcie ${i + 1}`} />
                    ) : (
                      '+'
                    )}
                    <input
                      ref={slotRefs[i]}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="post-auction-tips">
              <h4>
                <span>💡</span> Porady
              </h4>
              <ul>
                <li>Używaj naturalnego światła do zdjęć.</li>
                <li>Opisz historię oraz pochodzenie produktu.</li>
                <li>Ustaw niższą ofertę początkową, aby zachęcić do licytacji</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default PostAuction;
