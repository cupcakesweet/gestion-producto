import React, { useState } from 'react';
import { collection, addDoc, getDocs, where, query } from 'firebase/firestore';
import { db } from '../FireBase';

const Category = ({ user, categorias, setCategorias }) => {
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);

  const agregarCategoria = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debe iniciar sesión para agregar categorías');
      return;
    }
    
    if (!nuevaCategoria.trim()) {
      alert('Ingrese un nombre para la categoría');
      return;
    }
    
    try {
      const categoriasRef = collection(db, `usuarios/${user.uid}/categorias`);
      
      const q = query(categoriasRef, where("nombre", "==", nuevaCategoria.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        alert('Esta categoría ya existe');
        return;
      }
      
      const docRef = await addDoc(categoriasRef, { 
        nombre: nuevaCategoria.trim() 
      });
      
      setCategorias([...categorias, { id: docRef.id, nombre: nuevaCategoria.trim() }]);
      setNuevaCategoria('');
      setMostrarFormCategoria(false);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Error al agregar la categoría. Intente de nuevo.");
    }
  };

  return (
    <div className="category-section">
      <div className="category-header">
        <h3>Categorías</h3>
        <button 
          onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
          className="toggle-category-form-btn"
        >
          {mostrarFormCategoria ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>
      
      {mostrarFormCategoria && (
        <form onSubmit={agregarCategoria} className="category-form">
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Nombre de la categoría"
            className="category-input"
            required
          />
          <button type="submit" className="category-btn">Agregar</button>
        </form>
      )}
      
      <div className="category-list">
        {categorias.map(cat => (
          <span key={cat.id} className="category-tag">{cat.nombre}</span>
        ))}
      </div>
    </div>
  );
};

export default Category;