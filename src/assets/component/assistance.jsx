import React, { useState } from 'react';
import { db } from '../FireBase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import './Market.css';

const Assistance = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState('');

  const issueTypes = [
    'Problema técnico',
    'Funcionalidad no funciona',
    'Sugerencia de mejora',
    'Problema con inicio de sesión',
    'Otro'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!issueType || !description) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('Debes iniciar sesión para enviar una solicitud de ayuda');
      }

      const assistanceRef = collection(db, `usuarios/${user.uid}/solicitudesAsistencia`);
      
      await addDoc(assistanceRef, {
                    tipo: issueType,
            descripcion: description,
            fecha: serverTimestamp(),
            estado: 'pendiente',
            usuario: {
                uid: user.uid,
                email: user.email,
                nombre: user.displayName || 'Usuario anónimo'
            }
            });

      setSubmissionSuccess(true);
      setIssueType('');
      setDescription('');
      
      setTimeout(() => {
        setSubmissionSuccess(false);
        setShowForm(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting assistance request:", err);
      setError(err.message || 'Error al enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assistance-section">
      <button 
        onClick={() => setShowForm(!showForm)} 
        className="assistance-toggle-btn"
      >
        {showForm ? 'Ocultar asistencia' : 'Necesito ayuda'}
      </button>

      {showForm && (
        <div className="assistance-form-container fade-in">
          <h3>Formulario de Asistencia</h3>
          
          {submissionSuccess ? (
            <div className="success-message">
              <p>¡Gracias por tu solicitud! Hemos recibido tu reporte y nos pondremos en contacto contigo pronto.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="assistance-form">
              <div className="form-group">
                <label htmlFor="issueType" className="form-label">
                  Tipo de problema
                </label>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona un tipo</option>
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción detallada
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  rows="5"
                  disabled={isSubmitting}
                  placeholder="Describe el problema que estás experimentando o la sugerencia que quieres hacer..."
                ></textarea>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-buttons">
                <button
                  type="submit"
                  className="form-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="quick-assistance">
            <h4>Ayuda rápida</h4>
            <ul>
              <li>
                <strong>Problemas de inicio de sesión:</strong> Asegúrate de que estás usando el mismo proveedor (Google, GitHub, Facebook) con el que te registraste.
              </li>
              <li>
                <strong>Datos no se actualizan:</strong> Intenta recargar la página o cerrar y volver a abrir la aplicación.
              </li>
              <li>
                <strong>Contacto directo:</strong> Si es urgente, escribe a soporte@listademercado.com
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistance;