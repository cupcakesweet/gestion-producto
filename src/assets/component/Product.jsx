import React from 'react';
import { doc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../FireBase';

const Product = ({ 
  user, 
  categorias, 
  tiendas, 
  productos, 
  setProductos, 
  productoEditando, 
  setProductoEditando, 
  nuevoProducto, 
  setNuevoProducto,
  generarIdSecuencial
}) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: value
    });
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debe iniciar sesión para agregar productos');
      return;
    }
    
    if (!nuevoProducto.producto || !nuevoProducto.marca || !nuevoProducto.precio) {
      alert('Por favor complete los campos requeridos');
      return;
    }
    
    try {
      const secuencialId = await generarIdSecuencial(user.uid);
      
      const productoCompleto = {
        ...nuevoProducto,
        id: secuencialId,
        fecha: nuevoProducto.fecha || new Date().toISOString().split('T')[0],
        userId: user.uid
      };
      
      const productosRef = collection(db, `usuarios/${user.uid}/productos`);
      const docRef = await addDoc(productosRef, productoCompleto);
      
      productoCompleto.docId = docRef.id;
      
      setProductos([...productos, productoCompleto]);
      setNuevoProducto({
        id: '',
        producto: '',
        marca: '',
        precio: '',
        fecha: '',
        cantidad: 1,
        categoria: '',
        tienda: ''
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error al agregar el producto. Intente de nuevo.");
    }
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debe iniciar sesión para actualizar productos');
      return;
    }
    
    if (!productoEditando) {
      return;
    }
    
    try {
      const productoRef = doc(db, `usuarios/${user.uid}/productos`, productoEditando.docId);
      
      const datosActualizados = {
        producto: nuevoProducto.producto,
        marca: nuevoProducto.marca,
        precio: nuevoProducto.precio,
        fecha: nuevoProducto.fecha,
        cantidad: nuevoProducto.cantidad,
        categoria: nuevoProducto.categoria,
        tienda: nuevoProducto.tienda
      };
      
      await updateDoc(productoRef, datosActualizados);
      
      const productosActualizados = productos.map(prod => 
        prod.docId === productoEditando.docId 
          ? { ...prod, ...datosActualizados } 
          : prod
      );
      
      setProductos(productosActualizados);
      setProductoEditando(null);
      setNuevoProducto({
        id: '',
        producto: '',
        marca: '',
        precio: '',
        fecha: '',
        cantidad: 1,
        categoria: '',
        tienda: ''
      });
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error al actualizar el producto. Intente de nuevo.");
    }
  };

  const cancelarEdicion = () => {
    setProductoEditando(null);
    setNuevoProducto({
      id: '',
      producto: '',
      marca: '',
      precio: '',
      fecha: '',
      cantidad: 1,
      categoria: '',
      tienda: ''
    });
  };

  return (
    <form onSubmit={productoEditando ? actualizarProducto : agregarProducto} className="gestor-form">
      <h3>{productoEditando ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Producto</label>
          <input
            type="text"
            name="producto"
            value={nuevoProducto.producto}
            onChange={handleChange}
            className="form-input"
            placeholder="Nombre del producto"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Marca</label>
          <input
            type="text"
            name="marca"
            value={nuevoProducto.marca}
            onChange={handleChange}
            className="form-input"
            placeholder="Marca del producto"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Precio</label>
          <input
            type="number"
            name="precio"
            value={nuevoProducto.precio}
            onChange={handleChange}
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={nuevoProducto.fecha}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            value={nuevoProducto.cantidad}
            onChange={handleChange}
            className="form-input"
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            name="categoria"
            value={nuevoProducto.categoria}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Sin categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Tienda</label>
          <select
            name="tienda"
            value={nuevoProducto.tienda}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Seleccionar tienda</option>
            {tiendas.map(tienda => (
              <option key={tienda.id} value={tienda.nombre}>
                {tienda.nombre} ({tienda.proveedor})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group form-buttons">
          {productoEditando ? (
            <>
              <button type="submit" className="form-button update-btn">
                Actualizar Producto
              </button>
              <button type="button" onClick={cancelarEdicion} className="form-button cancel-btn">
                Cancelar
              </button>
            </>
          ) : (
            <button type="submit" className="form-button">
              Añadir Producto
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default Product;