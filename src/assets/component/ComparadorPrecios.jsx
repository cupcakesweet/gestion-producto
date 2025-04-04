import React, { useState } from "react";

const ComparadorPrecios = ({ productos }) => {
  const [mesInicio, setMesInicio] = useState('');
  const [mesFin, setMesFin] = useState('');
  const [resultadosComparacion, setResultadosComparacion] = useState(null);
  const [resumenGastos, setResumenGastos] = useState({});

  const meses = [
    { valor: 0, nombre: 'Enero' },
    { valor: 1, nombre: 'Febrero' },
    { valor: 2, nombre: 'Marzo' },
    { valor: 3, nombre: 'Abril' },
    { valor: 4, nombre: 'Mayo' },
    { valor: 5, nombre: 'Junio' },
    { valor: 6, nombre: 'Julio' },
    { valor: 7, nombre: 'Agosto' },
    { valor: 8, nombre: 'Septiembre' },
    { valor: 9, nombre: 'Octubre' },
    { valor: 10, nombre: 'Noviembre' },
    { valor: 11, nombre: 'Diciembre' }
  ];

  const convertirFecha = (fechaString) => {
    if (!fechaString) return null;
    return new Date(fechaString);
  };

  const calcularResumenGastos = (productos) => {
    const resumen = {};
  
    meses.forEach(mes => {
      resumen[mes.valor] = {
        total: 0,
        cantidadProductos: 0,
        promedio: 0
      };
    });
  
    productos.forEach(producto => {
      const fechaProducto = convertirFecha(producto.fecha);
      if (!fechaProducto) return;
      
      const mes = fechaProducto.getMonth();
      const precio = parseFloat(producto.precio) || 0;
      
      resumen[mes].total += precio;
      resumen[mes].cantidadProductos += 1;
    });

    meses.forEach(mes => {
      if (resumen[mes.valor].cantidadProductos > 0) {
        resumen[mes.valor].promedio = 
          resumen[mes.valor].total / resumen[mes.valor].cantidadProductos;
      }
    });
  
    setResumenGastos(resumen);
  };

  const compararPrecios = () => {
    if (mesInicio === '' || mesFin === '') {
      alert('Por favor seleccione meses a comparar');
      return;
    }
  
    const mesInicioNum = parseInt(mesInicio);
    const mesFinNum = parseInt(mesFin);
    
    calcularResumenGastos(productos);

    const productosFiltrados = productos.filter(producto => {
      const fechaProducto = convertirFecha(producto.fecha);
      if (!fechaProducto) return false;
    
      const mesProducto = fechaProducto.getMonth();
      return mesProducto === mesInicioNum || mesProducto === mesFinNum;
    });

    if (productosFiltrados.length === 0) {
      setResultadosComparacion([]);
      return;
    }

    const resultadosPorProducto = {};

    productosFiltrados.forEach(producto => {
      const fechaProducto = convertirFecha(producto.fecha);
      const mesProducto = fechaProducto.getMonth();
      const nombreProducto = producto.producto;
      const precio = parseFloat(producto.precio);

      if (!resultadosPorProducto[nombreProducto]) {
        resultadosPorProducto[nombreProducto] = {};
      }
      
      if (!resultadosPorProducto[nombreProducto][mesProducto]) {
        resultadosPorProducto[nombreProducto][mesProducto] = {
          total: 0,
          cantidad: 0,
          promedio: 0
        };
      }

      resultadosPorProducto[nombreProducto][mesProducto].total += precio;
      resultadosPorProducto[nombreProducto][mesProducto].cantidad += 1;
      resultadosPorProducto[nombreProducto][mesProducto].promedio = 
        resultadosPorProducto[nombreProducto][mesProducto].total / 
        resultadosPorProducto[nombreProducto][mesProducto].cantidad;
    });

    const resultadosConVariacion = Object.keys(resultadosPorProducto).map(nombreProducto => {
      const mesesData = resultadosPorProducto[nombreProducto];
      const preciosMeses = {};
      let variacionPorcentual = null;

      Object.keys(mesesData).forEach(mes => {
        preciosMeses[mes] = mesesData[mes].promedio;
      });
    
      if (preciosMeses[mesInicioNum] !== undefined && preciosMeses[mesFinNum] !== undefined) {
        const precioInicial = preciosMeses[mesInicioNum];
        const precioFinal = preciosMeses[mesFinNum];
        variacionPorcentual = ((precioFinal - precioInicial) / precioInicial) * 100;
      }
      
      return {
        producto: nombreProducto,
        preciosMeses,
        variacionPorcentual
      };
    });

    setResultadosComparacion(resultadosConVariacion);
  };

  return (
    <div className="comparador-precios-container">
      <h2>Comparador de Precios por Mes</h2>
      
      <div className="seleccion-meses">
        <div className="selector-mes">
          <label>Mes a comparar:</label>
          <select 
            value={mesInicio} 
            onChange={(e) => setMesInicio(e.target.value)}
          >
            <option value="">Seleccione un mes</option>
            {meses.map(mes => (
              <option key={`inicio-${mes.valor}`} value={mes.valor}>
                {mes.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div className="selector-mes">
          <label>Mes Actual:</label>
          <select 
            value={mesFin} 
            onChange={(e) => setMesFin(e.target.value)}
          >
            <option value="">Seleccione un mes</option>
            {meses.map(mes => (
              <option key={`fin-${mes.valor}`} value={mes.valor}>
                {mes.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={compararPrecios}
          disabled={mesInicio === '' || mesFin === ''}
          className="btn-comparar"
        >
          Comparar Precios
        </button>
      </div>
      
      {Object.keys(resumenGastos).length > 0 && (
        <div className="resumen-gastos">
          <h3>Resumen Completo de Gastos</h3>
          <table className="tabla-resumen">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Total Gastado</th>
                <th>Cantidad de Productos</th>
                <th>Promedio por Producto</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(resumenGastos)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(mes => {
                  const mesData = resumenGastos[mes];
                  return (
                    <tr key={`resumen-${mes}`}>
                      <td>{meses[parseInt(mes)]?.nombre}</td>
                      <td>${mesData.total.toFixed(2)}</td>
                      <td>{mesData.cantidadProductos}</td>
                      <td>${(mesData.promedio || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Resultados de Comparación */}
      {resultadosComparacion && resultadosComparacion.length > 0 ? (
        <div className="resultados-comparacion">
          <h3>Comparación entre {meses[parseInt(mesInicio)]?.nombre} y {meses[parseInt(mesFin)]?.nombre}</h3>
          <table className="tabla-comparacion">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio en {meses[parseInt(mesInicio)]?.nombre}</th>
                <th>Precio en {meses[parseInt(mesFin)]?.nombre}</th>
                <th>Variación</th>
              </tr>
            </thead>
            <tbody>
              {resultadosComparacion.map((resultado, index) => (
                <tr key={index}>
                  <td>{resultado.producto}</td>
                  <td>
                    {resultado.preciosMeses[mesInicio] !== undefined 
                      ? `$${resultado.preciosMeses[mesInicio].toFixed(2)}` 
                      : 'No disponible'}
                  </td>
                  <td>
                    {resultado.preciosMeses[mesFin] !== undefined 
                      ? `$${resultado.preciosMeses[mesFin].toFixed(2)}` 
                      : 'No disponible'}
                  </td>
                  <td className={
                    resultado.variacionPorcentual === null 
                      ? '' 
                      : resultado.variacionPorcentual > 0 
                        ? 'aumento' 
                        : resultado.variacionPorcentual < 0 
                          ? 'disminucion' 
                          : 'igual'
                  }>
                    {resultado.variacionPorcentual === null 
                      ? 'No comparable' 
                      : `${resultado.variacionPorcentual > 0 ? '+' : ''}${resultado.variacionPorcentual.toFixed(2)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : resultadosComparacion && resultadosComparacion.length === 0 ? (
        <div className="sin-resultados">
          No se encontraron productos en los meses seleccionados para comparar.
        </div>
      ) : null}
    </div>
  );
};

export default ComparadorPrecios;