import React, { useState, useEffect } from 'react';
import './Market.css';
import Product from './Product';
import Category from './Category';
import ComparadorPrecios from './ComparadorPrecios';
import Assistance from './assistance';

import facebook from "../facebook.png"

import { auth, db } from '../FireBase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut,
  FacebookAuthProvider,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  getDoc,
  setDoc,
  where 
} from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider(); 
const facebookProvider = new FacebookAuthProvider();

const GestorListaMercado = () => {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [hora, setHora] = useState(new Date());
  const [user, setUser] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    producto: '',
    marca: '',
    precio: '',
    fecha: '',
    cantidad: 1,
    categoria: '',
    tienda: '',
    activo: true
  });
  
  const [tiendas, setTiendas] = useState([]);
  const [nuevaTienda, setNuevaTienda] = useState({
    nombre: '',
    direccion: '',
    proveedor: ''
  });
  const [totalCompra, setTotalCompra] = useState(0);

  useEffect(() => {
    const timerID = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timerID);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        cargarProductos(currentUser.uid);
        cargarCategorias(currentUser.uid);
        cargarTiendas(currentUser.uid);
      } else {
        setProductos([]);
        setCategorias([]);
        setTiendas([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const nuevoTotal = productos.reduce((acc, item) => {
      return acc + (parseFloat(item.precio) * item.cantidad);
    }, 0);
    setTotalCompra(nuevoTotal);
  }, [productos]);

  const cargarProductos = async (userId) => {
    try {
      const productosRef = collection(db, `usuarios/${userId}/productos`);
      const q = query(productosRef, orderBy("id", "asc"));
      const querySnapshot = await getDocs(q);
      
      const productosData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id
      }));
      
      setProductos(productosData);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const cargarCategorias = async (userId) => {
    try {
      const categoriasRef = collection(db, `usuarios/${userId}/categorias`);
      const querySnapshot = await getDocs(categoriasRef);
      
      const categoriasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre
      }));
      
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const cargarTiendas = async (userId) => {
    try {
      const tiendasRef = collection(db, `usuarios/${userId}/tiendas`);
      const querySnapshot = await getDocs(tiendasRef);
      
      const tiendasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        proveedor: doc.data().proveedor,
        direccion: doc.data().direccion
      }));
      
      setTiendas(tiendasData);
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const agregarTienda = async () => {
    if (!nuevaTienda.nombre.trim()) {
      alert('El nombre de la tienda es requerido');
      return;
    }

    try {
      if (!user) {
        alert('Debe iniciar sesión para agregar tiendas');
        return;
      }

      const tiendasRef = collection(db, `usuarios/${user.uid}/tiendas`);
      await addDoc(tiendasRef, {
        nombre: nuevaTienda.nombre,
        direccion: nuevaTienda.direccion || '',
        proveedor: nuevaTienda.proveedor || 'personalizado'
      });

      // Limpiar el formulario y recargar tiendas
      setNuevaTienda({
        nombre: '',
        direccion: '',
        proveedor: ''
      });
      cargarTiendas(user.uid);
      alert('Tienda guardada exitosamente');
    } catch (error) {
      console.error("Error al guardar la tienda:", error);
      alert('No se pudo guardar la tienda');
    }
  };

  const generarIdSecuencial = async (userId) => {
    try {
      const counterRef = doc(db, `usuarios/${userId}/counters/productos`);
      const counterDoc = await getDoc(counterRef);
      
      let nextId = 1;

      if (counterDoc.exists()) {
        nextId = counterDoc.data().current + 1;
        await updateDoc(counterRef, { current: nextId });
      } else {
        await setDoc(counterRef, { current: nextId });
      }
      
      return nextId.toString().padStart(5, '0');
    } catch (error) {
      console.error("Error generating sequential ID:", error);
      return Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    }
  };

  const iniciarSesionConGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during Google sign in:", error);
    }
  };

  const iniciarSesionConGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during GitHub sign in:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('Ya existe una cuenta con el mismo correo electrónico pero con diferentes credenciales. Intente con otro método de inicio de sesión.');
      } else {
        alert('Error al iniciar sesión con GitHub. Intente de nuevo.');
      }
    }
  };
  
  const iniciarSesionConFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during Facebook sign in:", error);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const productosFiltrados = productos.filter(item => 
    item.producto.toLowerCase().includes(filtro.toLowerCase()) ||
    item.marca.toLowerCase().includes(filtro.toLowerCase()) ||
    item.precio.toLowerCase().includes(filtro.toLowerCase()) ||
    item.categoria.toLowerCase().includes(filtro.toLowerCase())
  )
  
  const toggleEstadoProducto = async (producto) => {
    try {
      if (!user) {
        alert('Debe iniciar sesión para realizar esta acción');
        return;
      }
  
      const productoRef = doc(db, `usuarios/${user.uid}/productos/${producto.docId}`);
      
      const nuevoEstado = !producto.activo;
      
      await updateDoc(productoRef, {
        activo: nuevoEstado
      });
  
      setProductos(productos.map(p => 
        p.docId === producto.docId 
          ? { ...p, activo: nuevoEstado } 
          : p
      ));
  
      const mensaje = nuevoEstado 
        ? `El producto "${producto.producto}" ha sido activado` 
        : `El producto "${producto.producto}" ha sido desactivado`;
      
      alert(mensaje);
    } catch (error) {
      console.error("Error al cambiar el estado del producto:", error);
      alert('No se pudo cambiar el estado del producto');
    }
  }

  return (
    <div className="gestor-container">
      <div className="gestor-header">
        <h1 className="gestor-title">Gestor Lista de Mercado</h1>
        <div className="gestor-clock">
          {hora.toLocaleTimeString()}
        </div>
      </div>
      
      {!user ? (
        <div className="auth-container">
          <h2>Iniciar Sesión</h2>
          <button onClick={iniciarSesionConGoogle} className="google-signin-btn">
            <img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" alt="Google" width="20" />
            Iniciar sesión con Google
          </button>
          <button onClick={iniciarSesionConGithub} className="github-signin-btn">
            <img src="https://cdn.cdnlogo.com/logos/g/69/github-icon.svg" alt="GitHub" width="20" />
            Iniciar sesión con GitHub
          </button>
          <button onClick={iniciarSesionConFacebook} className="facebook-signin-btn">
            <img src={facebook} alt="Facebook" width="20" />
            Iniciar sesión con facebook
          </button>
        </div>
      ) : (
        <>
          <div className="user-info">
            <div className="user-profile">
              {user.photoURL && <img src={user.photoURL} alt="Profile" className="user-avatar" />}
              <span>Hola, {user.displayName || user.email}</span>
            </div>
            <button onClick={cerrarSesion} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>

          <div className="stores-section">
            <h3>Tiendas</h3>
            
            <div className="add-store-form">
              <input
                type="text"
                placeholder="Nombre de la tienda"
                value={nuevaTienda.nombre}
                onChange={(e) => setNuevaTienda({...nuevaTienda, nombre: e.target.value})}
                className="store-input"
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                value={nuevaTienda.direccion}
                onChange={(e) => setNuevaTienda({...nuevaTienda, direccion: e.target.value})}
                className="store-input"
              />
              <input
                type="text"
                placeholder="Proveedor (opcional)"
                value={nuevaTienda.proveedor}
                onChange={(e) => setNuevaTienda({...nuevaTienda, proveedor: e.target.value})}
                className="store-input"
              />
              <button 
                onClick={agregarTienda}
                className="save-store-btn"
              >
                Guardar Tienda
              </button>
            </div>
            
            <div className="stores-list">
              {tiendas.length > 0 ? (
                tiendas.map(tienda => (
                  <div key={tienda.id} className="store-item">
                    <strong>{tienda.nombre}</strong>
                    {tienda.direccion && <span className="store-address">{tienda.direccion}</span>}
                    {tienda.proveedor && <span className="store-provider">{tienda.proveedor}</span>}
                  </div>
                ))
              ) : (
                <div className="no-stores">
                  No hay tiendas registradas. Agrega una nueva tienda.
                </div>
              )}
            </div>
          </div>
          
          <Category 
            user={user}
            categorias={categorias}
            setCategorias={setCategorias}
          />
  
          <Product 
            user={user}
            categorias={categorias}
            tiendas={tiendas}
            productos={productos}
            setProductos={setProductos}
            productoEditando={productoEditando}
            setProductoEditando={setProductoEditando}
            nuevoProducto={nuevoProducto}
            setNuevoProducto={setNuevoProducto}
            generarIdSecuencial={generarIdSecuencial}
          />
          <Assistance user={user} />
          <div className="gestor-search">
            <input
              type="text"
              placeholder="Buscar producto,marca o por..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="total-section">
            <h3>Total de productos: {productosFiltrados.length}</h3>
            <h2>Total de la compra: ${totalCompra.toFixed(2)}</h2>
          </div>
          <div className="gestor-table-container">
            <table className="gestor-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Tienda</th>
                  <th>Fecha</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((item) => (
                    <tr key={item.docId} className="fade-in">
                      <td className="id-cell">{item.id}</td>
                      <td className="producto-cell">{item.producto}</td>
                      <td className="marca-cell">{item.marca}</td>
                      <td className="categoria-cell">{item.categoria || 'Sin categoría'}</td>
                      <td className="tienda-cell">{item.tienda || 'Sin tienda'}</td>
                      <td className="fecha-cell">{item.fecha}</td>
                      <td className="precio-cell">${parseFloat(item.precio).toFixed(2)}</td>
                      <td className="cantidad-cell">{item.cantidad}</td>
                      <td className="total-cell">${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</td>
                      <td className="actions-cell">
                      <button 
                      onClick={() => setProductoEditando(item)}
                         className="action-btn edit-btn"
                         title="Editar"
                            >
                        ✏️
                      </button>
                        <button 
    onClick={() => toggleEstadoProducto(item)}
    className={`action-btn ${item.activo ? 'deactivate-btn' : 'activate-btn'}`}
    title={item.activo ? "Desactivar" : "Activar"}
  >
    {item.activo ? '❌' : '✅'}
  </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-message">
                      No hay productos en la lista
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ComparadorPrecios productos={productos} />
        </>
      )}
    </div>
  );
}

export default GestorListaMercado;