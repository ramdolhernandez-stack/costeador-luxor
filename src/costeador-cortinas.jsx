import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Ruler, X, Calculator, ScrollText, Copy, Files, Loader2, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

/* ============================================================================
   COSTEADOR DE CORTINAS — Luxor Group
   Lee catálogos EN VIVO desde Google Sheets (vía Apps Script API).
   Fórmula única: Costo = (Precio ÷ Presentación) × Valor(Tipo_Cálculo) × Cantidad_Base
   ============================================================================ */

const API_URL = "/api/catalogos";

// Respaldo (muestra) por si el entorno bloquea la conexión en vivo (ej. este chat).
// En Vercel/Netlify la conexión real funcionará y estos datos no se usan.
const RESPALDO = {"CONFIGURACIÓN": {"costoFijoUnitario": 13000, "instalacion": [{"Tipo_Producto": "Roller Simple", "Precio_Instalación": 9000, "Visible": true, "Activo": "SI"}, {"Tipo_Producto": "Roller Doble", "Precio_Instalación": 13500, "Visible": true, "Activo": "SI"}, {"Tipo_Producto": "Roller Duo", "Precio_Instalación": 10000, "Visible": true, "Activo": "SI"}]}, "CATÁLOGO_MATERIALES": [{"ID_Materiales": "MAT045", "Categoría": "Tela", "Descripción 1": "Black Out", "Descripción 2": "Jaspeado C Linen 300", "Presentación": 100, "Precio_Unitario": 16000, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "B3301", "Stock_Estimado": 0, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT046", "Categoría": "Tela", "Descripción 1": "Black Out", "Descripción 2": "Jaspeado O Linen 250", "Presentación": 100, "Precio_Unitario": 13200, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "B3301", "Stock_Estimado": 0, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT004", "Categoría": "Tubo Cabezal", "Descripción 1": "38mm blanco", "Descripción 2": "1,0mm", "Presentación": 580, "Precio_Unitario": 19500, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-T38", "Stock_Estimado": 5, "Fecha_Actualización": "2026-06-27T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT005", "Categoría": "Tubo Cabezal", "Descripción 1": "38mm", "Descripción 2": "0,8mm", "Presentación": 580, "Precio_Unitario": 12500, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "RT-201201", "Stock_Estimado": 40, "Fecha_Actualización": "2026-06-27T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT009", "Categoría": "Base Roller", "Descripción 1": "rectangular Blanco/Negro MATE", "Descripción 2": "1,2mm", "Presentación": 580, "Precio_Unitario": 15900, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-TR", "Stock_Estimado": 20, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT010", "Categoría": "Base Roller", "Descripción 1": "rectangular Blanco/Negro BRILLANTE", "Descripción 2": "1,0mm", "Presentación": 580, "Precio_Unitario": 13000, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "RBT-8622", "Stock_Estimado": 20, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT008", "Categoría": "Base Duo", "Descripción 1": "Set", "Descripción 2": "Pez + Espaguetti", "Presentación": 580, "Precio_Unitario": 24300, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-TPE", "Stock_Estimado": 10, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT001", "Categoría": "Cenefa", "Descripción 1": "Cenefa 73mm", "Descripción 2": "blanco  : MATE", "Presentación": 580, "Precio_Unitario": 31800, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-CS73", "Stock_Estimado": 6, "Fecha_Actualización": "2026-06-27T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT002", "Categoría": "Cenefa", "Descripción 1": "Cenefa 55mm", "Descripción 2": "Blanco / Marfil / Negro MATE", "Presentación": 580, "Precio_Unitario": 21900, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-CS55", "Stock_Estimado": 6, "Fecha_Actualización": "2026-06-27T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT021", "Categoría": "Mecanismo Simple", "Descripción 1": "Normal", "Descripción 2": "c/Cadena 6m", "Presentación": 10, "Precio_Unitario": 14000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "UN-JL-009", "Stock_Estimado": 20, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT022", "Categoría": "Mecanismo Simple", "Descripción 1": "Premium", "Descripción 2": "7cm", "Presentación": 5, "Precio_Unitario": 12500, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "UN-JL-026", "Stock_Estimado": 10, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT024", "Categoría": "Mecanismo Doble", "Descripción 1": "11,5cm", "Descripción 2": "s/Tapa", "Presentación": 1, "Precio_Unitario": 4500, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "UN-SBL-005", "Stock_Estimado": 5, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT025", "Categoría": "Mecanismo Doble", "Descripción 1": "11,5cm", "Descripción 2": "c/Tapa", "Presentación": 1, "Precio_Unitario": 5500, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "UN-SBL-005", "Stock_Estimado": 5, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT018", "Categoría": "Mecanismo Duo", "Descripción 1": "38mm", "Descripción 2": "Premium", "Presentación": 1, "Precio_Unitario": 9900, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-M38P", "Stock_Estimado": 5, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT019", "Categoría": "Mecanismo Duo", "Descripción 1": "38mm", "Descripción 2": "Set", "Presentación": 20, "Precio_Unitario": 36000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-M38N", "Stock_Estimado": 20, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT037", "Categoría": "Cadena Rollo", "Descripción 1": "150m", "Descripción 2": "Blanco / Negro", "Presentación": 15000, "Precio_Unitario": 12500, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ALTO", "Cantidad_Base": 2, "Proveedor": "Cima kim", "Código Proveedor": "", "Stock_Estimado": 1, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT038", "Categoría": "Peso Cadena", "Descripción 1": "Normal", "Descripción 2": "Blanco", "Presentación": 20, "Precio_Unitario": 18000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-PN", "Stock_Estimado": 5, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT039", "Categoría": "Peso Cadena", "Descripción 1": "Normal", "Descripción 2": "Negro", "Presentación": 20, "Precio_Unitario": 23000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-PNN", "Stock_Estimado": 5, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}, {"ID_Materiales": "MAT014", "Categoría": "Tapa Base", "Descripción 1": "Pez (duo) + Espaguetti", "Descripción 2": "Blanco / Marfil / Negro MATE", "Presentación": 20, "Precio_Unitario": 13800, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-TTPE", "Stock_Estimado": 1, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT012", "Categoría": "Tapa Cenefa", "Descripción 1": "73mm", "Descripción 2": "Blanco Mate", "Presentación": 20, "Precio_Unitario": 17800, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-TCS73", "Stock_Estimado": 6, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT029", "Categoría": "Zuncho", "Descripción 1": "9mm c/Adhesivo", "Descripción 2": "", "Presentación": 15000, "Precio_Unitario": 18800, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 2, "Proveedor": "Cima kim", "Código Proveedor": "NK-Z0915", "Stock_Estimado": 1, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT041", "Categoría": "Unión Cadena", "Descripción 1": "Normal", "Descripción 2": "Blanco", "Presentación": 50, "Precio_Unitario": 2500, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "UN-ZK-004", "Stock_Estimado": 300, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT026", "Categoría": "Soporte Duo", "Descripción 1": "Pared", "Descripción 2": "", "Presentación": 50, "Precio_Unitario": 15000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-SM", "Stock_Estimado": 50, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT042", "Categoría": "Tope", "Descripción 1": "Normal", "Descripción 2": "Blanco", "Presentación": 50, "Precio_Unitario": 2500, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 2, "Proveedor": "Cima kim", "Código Proveedor": "UN-ZK-002", "Stock_Estimado": 300, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT043", "Categoría": "Bolsa Empaque", "Descripción 1": "Transparente", "Descripción 2": "Transparente", "Presentación": 40000, "Precio_Unitario": 62800, "Unidad_Medida (cm ó unidad)": "CM", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "ANCHO", "Cantidad_Base": 1.2, "Proveedor": "Cima kim", "Código Proveedor": "NK-BE", "Stock_Estimado": 100, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT044", "Categoría": "Tornillo ", "Descripción 1": "Roscalata", "Descripción 2": "6mm", "Presentación": 100, "Precio_Unitario": 4000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 5, "Proveedor": "Cima kim", "Código Proveedor": "NK-TC", "Stock_Estimado": 100, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "NO", "validador": ""}, {"ID_Materiales": "MAT032", "Categoría": "Cadena continua", "Descripción 1": "1,0m", "Descripción 2": "Blanco", "Presentación": 20, "Precio_Unitario": 18000, "Unidad_Medida (cm ó unidad)": "U", "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)": "CANTIDAD", "Cantidad_Base": 1, "Proveedor": "Cima kim", "Código Proveedor": "NK-C10", "Stock_Estimado": 1, "Fecha_Actualización": "2026-06-28T07:00:00.000Z", "Visible_en_App": "SI", "validador": ""}], "CATÁLOGO_PRODUCTOS": [{"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Tela", "Material_Sugerido_ID": "MAT045", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "MAT031", "Acoplamiento_Automático": "SI", "Notas": "Tela con zuncho en posicion"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Tubo Cabezal", "Material_Sugerido_ID": "MAT005", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "38mm  de 0,8mm"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Base Roller", "Material_Sugerido_ID": "MAT009", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "MAT015", "Acoplamiento_Automático": "SI", "Notas": "Contrapeso con tapa"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Mecanismo Simple", "Material_Sugerido_ID": "MAT021", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Viene con cadena de 600 cm"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Cadena Rollo", "Material_Sugerido_ID": "MAT037", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "MAT041", "Acoplamiento_Automático": "SI", "Notas": "Cadena a medida con unión"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Tope", "Material_Sugerido_ID": "MAT042", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Frenos de cadena"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Bolsa Empaque", "Material_Sugerido_ID": "MAT043", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Empaque"}, {"ID_Producto": "PROD001", "Tipo_Producto": "Roller Simple", "Categoría_Material": "Tornillo ", "Material_Sugerido_ID": "MAT044", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 4, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Instalacion"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Tela", "Material_Sugerido_ID": "MAT045", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "MAT031", "Acoplamiento_Automático": "SI", "Notas": "Tela con zuncho en posicion"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Tubo Cabezal", "Material_Sugerido_ID": "MAT005", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "38mm  de 0,8mm"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Base Roller", "Material_Sugerido_ID": "MAT009", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "MAT015", "Acoplamiento_Automático": "SI", "Notas": "Contrapeso con tapa"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Mecanismo Doble", "Material_Sugerido_ID": "MAT024", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Viene con cadena de 600 cm"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Cadena Rollo", "Material_Sugerido_ID": "MAT037", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "MAT041", "Acoplamiento_Automático": "SI", "Notas": "Cadena a medida con unión"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Tope", "Material_Sugerido_ID": "MAT042", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 4, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Frenos de cadena"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Bolsa Empaque", "Material_Sugerido_ID": "MAT043", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Empaque"}, {"ID_Producto": "PROD002", "Tipo_Producto": "Roller Doble", "Categoría_Material": "Tornillo ", "Material_Sugerido_ID": "MAT044", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 4, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": "Instalacion"}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Tela", "Material_Sugerido_ID": "MAT073", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "MAT031,MAT030", "Acoplamiento_Automático": "SI", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Base Duo", "Material_Sugerido_ID": "MAT008", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "MAT014", "Acoplamiento_Automático": "SI", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Tubo Cabezal", "Material_Sugerido_ID": "MAT005", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Cenefa", "Material_Sugerido_ID": "MAT002", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "MAT013", "Acoplamiento_Automático": "SI", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Mecanismo Duo", "Material_Sugerido_ID": "MAT018", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Cadena Rollo", "Material_Sugerido_ID": "MAT037", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "MAT041", "Acoplamiento_Automático": "SI", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Peso Cadena", "Material_Sugerido_ID": "MAT038", "Obligatorio": "SI", "Visible_en_App": "SI", "Cantidad_Multiplicador": 1, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Tope", "Material_Sugerido_ID": "MAT042", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 4, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Bolsa Empaque", "Material_Sugerido_ID": "MAT043", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 2, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": ""}, {"ID_Producto": "PROD003", "Tipo_Producto": "Roller Duo", "Categoría_Material": "Tornillo ", "Material_Sugerido_ID": "MAT044", "Obligatorio": "SI", "Visible_en_App": "No", "Cantidad_Multiplicador": 4, "Acoplamiento_Material_ID": "", "Acoplamiento_Automático": "No", "Notas": ""}], "CATÁLOGO_ADICIONALES": [{"ID_Adicional": "ADI001", "Descripción": "Seguro de Cadena", "Categoria/Sector": "Instalación", "Precio_Fijo": 2000, "Compatible_Con": "TODOS", "Visible_en_App": "SI", "Notas": "Protección Adicional"}, {"ID_Adicional": "ADI002", "Descripción": "Resanación", "Categoria/Sector": "Instalación", "Precio_Fijo": 4000, "Compatible_Con": "TODOS", "Visible_en_App": "SI", "Notas": "Resanacion de área"}, {"ID_Adicional": "ADI003", "Descripción": "Cambio de piola guía", "Categoria/Sector": "Servicio Técnico", "Precio_Fijo": 10000, "Compatible_Con": "PROD002", "Visible_en_App": "NO", "Notas": "Cambio de guía"}]};

const IVA_PCT = 0.19;

const clp = (n) =>
  (isFinite(n) ? n : 0).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// Normaliza texto para comparar (ignora may/min, tildes, espacios extra)
const norm = (s) => String(s ?? "").trim().toLowerCase();
const esSi = (v) => norm(v) === "si" || v === true || norm(v) === "sí" || norm(v) === "true";

// Nombres de columnas (según el JSON real del Sheet)
const COL = {
  matId: "ID_Materiales",
  matCat: "Categoría",
  d1: "Descripción 1",
  d2: "Descripción 2",
  pres: "Presentación",
  precio: "Precio_Unitario",
  tipoCalc: "Tipo_Cálculo (ALTO / ANCHO / N/A / CANTIDAD)",
  cb: "Cantidad_Base",
  matVis: "Visible_en_App",
  prodId: "ID_Producto",
  prodTipo: "Tipo_Producto",
  prodCat: "Categoría_Material",
  sugerido: "Material_Sugerido_ID",
  obl: "Obligatorio",
  prodVis: "Visible_en_App",
  acopl: "Acoplamiento_Material_ID",
  adiId: "ID_Adicional",
  adiDesc: "Descripción",
  adiPrecio: "Precio_Fijo",
  adiCompat: "Compatible_Con",
  adiVis: "Visible_en_App",
};

/* ============================ FÓRMULA ÚNICA ============================ */
function calcularCosto(mat, ancho, alto) {
  const tipo = norm(mat[COL.tipoCalc]);
  const valor = tipo === "alto" ? alto : tipo === "ancho" ? ancho : 1;
  const precio = Number(mat[COL.precio]) || 0;
  const pres = Number(mat[COL.pres]) || 1;
  const cb = Number(mat[COL.cb]);
  return (precio / pres) * valor * (isFinite(cb) ? cb : 1);
}

/* ============================ COMPONENTE ============================ */
export default function Costeador() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enVivo, setEnVivo] = useState(false);
  const [errorConexion, setErrorConexion] = useState(null);

  const [form, setForm] = useState(null);
  const [cortinas, setCortinas] = useState([]);
  const [margen, setMargen] = useState(30);
  const [cargos, setCargos] = useState([]);
  const [nuevoCargo, setNuevoCargo] = useState({ desc: "", obs: "", monto: "", signo: "suma" });
  const [showDesglose, setShowDesglose] = useState(false);
  const [cortinaAbierta, setCortinaAbierta] = useState(null);
  const [ded, setDed] = useState({
    comision: { mode: "pct", value: 10 },
    gastosOp: { mode: "pct", value: 8 },
    fondoReserva: { mode: "pct", value: 5 },
  });

  // Cargar datos: intenta en vivo, cae a respaldo
  useEffect(() => {
    let vivo = false;
    (async () => {
      try {
        const r = await fetch(API_URL, { redirect: "follow" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();
        if (!j["CATÁLOGO_MATERIALES"]) throw new Error("Formato inesperado");
        setDatos(j); setEnVivo(true); vivo = true;
      } catch (e) {
        setErrorConexion(String(e.message || e));
        setDatos(RESPALDO); setEnVivo(false);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  async function reconectar() {
    setCargando(true); setErrorConexion(null);
    try {
      const r = await fetch(API_URL, { redirect: "follow" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if (!j["CATÁLOGO_MATERIALES"]) throw new Error("Formato inesperado");
      setDatos(j); setEnVivo(true);
    } catch (e) {
      setErrorConexion(String(e.message || e));
      setDatos(RESPALDO); setEnVivo(false);
    } finally {
      setCargando(false);
    }
  }

  // ---- Derivados de los datos ----
  const productos = useMemo(() => {
    if (!datos) return [];
    const instal = datos["CONFIGURACIÓN"]?.instalacion || [];
    const activos = instal.filter((p) => esSi(p.Activo));
    // productos que existen en CATÁLOGO_PRODUCTOS
    const enProd = new Set((datos["CATÁLOGO_PRODUCTOS"] || []).map((r) => norm(r[COL.prodTipo])));
    return activos
      .filter((p) => enProd.has(norm(p.Tipo_Producto)))
      .map((p) => ({
        tipo: p.Tipo_Producto,
        instalacion: Number(p["Precio_Instalación"]) || 0,
        tieneInstalacion: p["Precio_Instalación"] != null && p["Precio_Instalación"] !== "",
      }));
  }, [datos]);

  const materialesPorId = useMemo(() => {
    const m = {};
    (datos?.["CATÁLOGO_MATERIALES"] || []).forEach((mat) => {
      if (mat[COL.matId]) m[mat[COL.matId]] = mat;
    });
    return m;
  }, [datos]);

  const materialesPorCat = useMemo(() => {
    const m = {};
    (datos?.["CATÁLOGO_MATERIALES"] || []).forEach((mat) => {
      const cat = norm(mat[COL.matCat]);
      if (!cat) return;
      if (!esSi(mat[COL.matVis])) return; // solo visibles/en stock
      (m[cat] = m[cat] || []).push(mat);
    });
    return m;
  }, [datos]);

  // Categorías visibles (que elige el vendedor) por producto
  function categoriasVisibles(tipoProducto) {
    return (datos?.["CATÁLOGO_PRODUCTOS"] || [])
      .filter((r) => norm(r[COL.prodTipo]) === norm(tipoProducto) && esSi(r[COL.prodVis]));
  }
  // Todas las filas del producto (para acoplamientos e invisibles)
  function filasProducto(tipoProducto) {
    return (datos?.["CATÁLOGO_PRODUCTOS"] || [])
      .filter((r) => norm(r[COL.prodTipo]) === norm(tipoProducto));
  }

  const adicionales = useMemo(() => {
    return (datos?.["CATÁLOGO_ADICIONALES"] || []).filter((a) => esSi(a[COL.adiVis]));
  }, [datos]);

  // Inicializa el formulario cuando hay productos
  useEffect(() => {
    if (!datos || productos.length === 0 || form) return;
    setForm(nuevoForm(productos[0].tipo));
  }, [datos, productos]);

  function nuevoForm(tipoProducto) {
    const cats = categoriasVisibles(tipoProducto);
    const sel = {};
    cats.forEach((c) => { sel[norm(c[COL.prodCat])] = ""; }); // arrancan vacíos
    return { producto: tipoProducto, ancho: "", alto: "", selecciones: sel, adicionales: [], instalacion: true };
  }

  function cambiarProducto(tipo) {
    setForm(nuevoForm(tipo));
  }

  const catsVis = form ? categoriasVisibles(form.producto) : [];
  const prodInfo = productos.find((p) => norm(p.tipo) === norm(form?.producto));

  const camposCompletos = form && form.ancho > 0 && form.alto > 0 &&
    catsVis.every((c) => form.selecciones[norm(c[COL.prodCat])]);

  const faltantes = [];
  if (form) {
    if (!(form.ancho > 0)) faltantes.push("Ancho");
    if (!(form.alto > 0)) faltantes.push("Alto");
    catsVis.forEach((c) => {
      if (!form.selecciones[norm(c[COL.prodCat])]) faltantes.push(c[COL.prodCat]);
    });
  }

  /* ---- Cálculo de una cortina ---- */
  function construirDesglose(cortina) {
    const lineas = [];
    let costoVariable = 0;
    const filas = filasProducto(cortina.producto);

    filas.forEach((fila) => {
      const catKey = norm(fila[COL.prodCat]);
      const esVisible = esSi(fila[COL.prodVis]);
      let mat = null;

      if (esVisible) {
        const id = cortina.selecciones[catKey];
        mat = id ? materialesPorId[id] : null;
      } else {
        // invisible: usa el material sugerido de la fila
        mat = materialesPorId[fila[COL.sugerido]];
      }
      if (mat) {
        const costo = calcularCosto(mat, cortina.ancho, cortina.alto);
        costoVariable += costo;
        lineas.push({
          label: esVisible
            ? `${fila[COL.prodCat]} — ${mat[COL.d1]} ${mat[COL.d2] || ""}`.trim()
            : `${fila[COL.prodCat]} (incluido)`,
          costo, tipo: esVisible ? "sel" : "auto",
        });
      }

      // Acoplamientos (uno o varios separados por coma)
      const ac = String(fila[COL.acopl] || "").trim();
      if (ac) {
        ac.split(",").map((x) => x.trim()).filter(Boolean).forEach((acId) => {
          const acMat = materialesPorId[acId];
          if (acMat) {
            const c = calcularCosto(acMat, cortina.ancho, cortina.alto);
            costoVariable += c;
            lineas.push({ label: `↳ ${acMat[COL.matCat]} (automático)`, costo: c, tipo: "auto" });
          }
        });
      }
    });

    // Adicionales
    cortina.adicionales.forEach((adiId) => {
      const adi = (datos["CATÁLOGO_ADICIONALES"] || []).find((a) => a[COL.adiId] === adiId);
      if (adi) {
        const p = Number(adi[COL.adiPrecio]) || 0;
        costoVariable += p;
        lineas.push({ label: `+ ${adi[COL.adiDesc]}`, costo: p, tipo: "adi" });
      }
    });

    const precioInstal = prodInfoDe(cortina.producto)?.instalacion || 0;
    const instalacion = cortina.instalacion ? precioInstal : 0;
    return { lineas, costoVariable, instalacion, subtotal: costoVariable + instalacion };
  }

  function prodInfoDe(tipo) {
    return productos.find((p) => norm(p.tipo) === norm(tipo));
  }

  /* ---- Acciones ---- */
  function agregarCortina() {
    if (!camposCompletos) return;
    setCortinas((prev) => [...prev, { ...form, id: Date.now() }]);
    setForm(nuevoForm(form.producto));
  }
  function copiarUltima() {
    if (cortinas.length === 0) return;
    const u = cortinas[cortinas.length - 1];
    setForm({ producto: u.producto, ancho: "", alto: "", selecciones: { ...u.selecciones }, adicionales: [...u.adicionales], instalacion: u.instalacion });
  }
  function duplicar(id) {
    const c = cortinas.find((x) => x.id === id);
    if (!c) return;
    setForm({ producto: c.producto, ancho: "", alto: "", selecciones: { ...c.selecciones }, adicionales: [...c.adicionales], instalacion: c.instalacion });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function quitar(id) { setCortinas((p) => p.filter((c) => c.id !== id)); }
  function toggleAdic(id) {
    setForm((f) => ({ ...f, adicionales: f.adicionales.includes(id) ? f.adicionales.filter((a) => a !== id) : [...f.adicionales, id] }));
  }
  function agregarCargo() {
    const m = parseFloat(nuevoCargo.monto);
    if (!nuevoCargo.desc || !m) return;
    setCargos((p) => [...p, { ...nuevoCargo, monto: m, id: Date.now() }]);
    setNuevoCargo({ desc: "", obs: "", monto: "", signo: "suma" });
  }
  function quitarCargo(id) { setCargos((p) => p.filter((c) => c.id !== id)); }

  const calculo = useMemo(() => {
    if (!datos) return null;
    const desg = cortinas.map((c) => ({ id: c.id, ...construirDesglose(c) }));
    const totalCortinas = desg.reduce((s, c) => s + c.subtotal, 0);
    const margenValor = totalCortinas * (margen / 100);
    const subtotalConMargen = totalCortinas + margenValor;
    const cargosNet = cargos.reduce((s, c) => s + (c.signo === "suma" ? c.monto : -c.monto), 0);
    const subtotalAntesIva = subtotalConMargen + cargosNet;
    const iva = subtotalAntesIva * IVA_PCT;
    const totalFinal = subtotalAntesIva + iva;
    const md = (d) => d.mode === "pct" ? margenValor * ((Number(d.value) || 0) / 100) : (Number(d.value) || 0);
    const dedMontos = { comision: md(ded.comision), gastosOp: md(ded.gastosOp), fondoReserva: md(ded.fondoReserva) };
    const dedTotal = dedMontos.comision + dedMontos.gastosOp + dedMontos.fondoReserva;
    return { desg, totalCortinas, margenValor, subtotalConMargen, cargosNet, subtotalAntesIva, iva, totalFinal, dedMontos, dedTotal, margenNeto: margenValor - dedTotal };
  }, [cortinas, margen, cargos, ded, datos]);

  const previewActual = useMemo(() => {
    if (!camposCompletos) return null;
    return construirDesglose(form);
  }, [form, camposCompletos, datos]);

  /* ============================ RENDER ============================ */
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F4EE" }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-3" size={28} color="#12213E" />
          <p style={{ fontFamily: "system-ui", color: "#6B6455", fontSize: 14 }}>Cargando catálogos…</p>
        </div>
      </div>
    );
  }

  if (!datos || productos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F7F4EE" }}>
        <div className="max-w-md text-center" style={{ fontFamily: "system-ui" }}>
          <AlertTriangle className="mx-auto mb-3" size={28} color="#B4552F" />
          <p style={{ color: "#2A2A2A", fontSize: 15, marginBottom: 8 }}>No hay productos activos para mostrar.</p>
          <p style={{ color: "#9C9584", fontSize: 13 }}>Verifica que en CONFIGURACIÓN haya productos con Activo=SÍ y sus materiales en CATÁLOGO_PRODUCTOS.</p>
          <button onClick={reconectar} className="mt-4 px-4 py-2 rounded-md text-sm" style={{ background: "#12213E", color: "white" }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7F4EE", fontFamily: "Georgia, serif" }}>
      <style>{`
        .sans { font-family: -apple-system, 'Segoe UI', ui-sans-serif, system-ui, sans-serif; }
        .caps { font-family: -apple-system, 'Segoe UI', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; }
        select { -webkit-appearance:none; -moz-appearance:none; appearance:none; }
      `}</style>

      <header className="relative overflow-hidden" style={{ background: "#12213E" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#C9A24B 0,#C9A24B 1px,transparent 1px,transparent 14px)" }} />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-8 flex items-start justify-between">
          <div>
            <p className="sans text-[11px] caps text-[#C9A24B] mb-1">Luxor Group · Terreno</p>
            <h1 className="text-2xl sm:text-4xl text-[#F7F4EE] tracking-tight">Costeador de Cortinas</h1>
            <p className="sans text-sm text-[#9FB0CC] mt-1">Cotización instantánea en sitio</p>
          </div>
          <button onClick={reconectar} title="Recargar catálogos"
            className="sans flex items-center gap-1.5 text-[10px] caps px-2.5 py-1.5 rounded-md shrink-0"
            style={{ border: "1px solid " + (enVivo ? "#3E6B52" : "#8A5A2A"), color: enVivo ? "#9FD8B5" : "#E8C07C", background: "rgba(255,255,255,0.04)" }}>
            {enVivo ? <Wifi size={12} /> : <WifiOff size={12} />} {enVivo ? "En vivo" : "Respaldo"}
          </button>
        </div>
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg,transparent,#C9A24B,transparent)" }} />
      </header>

      {!enVivo && (
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-4">
          <div className="sans text-xs rounded-md px-4 py-2.5 flex items-center gap-2" style={{ background: "#FBEFE7", border: "1px solid #F0D9C8", color: "#8C3F22" }}>
            <AlertTriangle size={14} className="shrink-0" />
            <span>Mostrando datos de respaldo (muestra). La conexión en vivo se bloqueó en este entorno; al publicar en Vercel/Netlify leerá tu Google Sheets real.</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <div className="space-y-6">
          {/* PRODUCTO */}
          <section className="bg-white rounded-lg border border-[#E4DFD3] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="sans text-[11px] caps text-[#12213E] font-semibold">Tipo de producto</h2>
              {cortinas.length > 0 && (
                <button onClick={copiarUltima} className="sans flex items-center gap-1.5 text-[11px] caps px-2.5 py-1.5 rounded-md"
                  style={{ border: "1px solid #C9A24B", color: "#9A7B24", background: "#FBF6EA" }}><Copy size={12} /> Copiar última</button>
              )}
            </div>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(productos.length,3)},1fr)` }}>
              {productos.map((p) => {
                const sel = norm(form?.producto) === norm(p.tipo);
                return (
                  <button key={p.tipo} onClick={() => cambiarProducto(p.tipo)}
                    className="sans text-center px-2 py-3.5 rounded-md text-sm transition-colors"
                    style={{ borderColor: sel ? "#12213E" : "#D8D2C2", background: sel ? "#12213E" : "white", color: sel ? "#F7F4EE" : "#2A2A2A", borderWidth: sel ? 2 : 1, borderStyle: "solid" }}>
                    {p.tipo}
                  </button>
                );
              })}
            </div>
          </section>

          {/* MEDIDAS */}
          <section className="bg-white rounded-lg border border-[#E4DFD3] shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={16} className="text-[#12213E]" />
              <h2 className="sans text-[11px] caps text-[#12213E] font-semibold">Medidas de la cortina</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="sans text-xs text-[#6B6455] block mb-1.5">Ancho (cm)</span>
                <input type="number" inputMode="decimal" value={form?.ancho || ""} onChange={(e) => setForm((f) => ({ ...f, ancho: e.target.value }))}
                  placeholder="150" className="w-full sans text-lg px-3 py-2.5 rounded-md border border-[#D8D2C2] focus:border-[#12213E] focus:outline-none" />
              </label>
              <label className="block">
                <span className="sans text-xs text-[#6B6455] block mb-1.5">Alto (cm)</span>
                <input type="number" inputMode="decimal" value={form?.alto || ""} onChange={(e) => setForm((f) => ({ ...f, alto: e.target.value }))}
                  placeholder="220" className="w-full sans text-lg px-3 py-2.5 rounded-md border border-[#D8D2C2] focus:border-[#12213E] focus:outline-none" />
              </label>
            </div>
          </section>

          {/* MATERIALES */}
          <section className="bg-white rounded-lg border border-[#E4DFD3] shadow-sm p-5 sm:p-6">
            <h2 className="sans text-[11px] caps text-[#12213E] font-semibold mb-1">Selección de materiales</h2>
            <p className="sans text-xs text-[#9C9584] mb-4">Todos obligatorios. Elige de cada lista según lo que lleva la cortina.</p>
            <div className="space-y-4">
              {catsVis.map((cat) => {
                const catKey = norm(cat[COL.prodCat]);
                const opciones = materialesPorCat[catKey] || [];
                return (
                  <div key={cat[COL.prodCat]}>
                    <span className="sans text-xs text-[#6B6455] block mb-1.5">{cat[COL.prodCat]} <span className="text-[#C9A24B]">*</span></span>
                    <div className="relative">
                      <select value={form.selecciones[catKey] || ""} onChange={(e) => setForm((f) => ({ ...f, selecciones: { ...f.selecciones, [catKey]: e.target.value } }))}
                        className="w-full sans text-sm px-3 py-2.5 pr-9 rounded-md border border-[#D8D2C2] bg-white focus:border-[#12213E] focus:outline-none cursor-pointer">
                        <option value="">Seleccionar…</option>
                        {opciones.map((m) => (
                          <option key={m[COL.matId]} value={m[COL.matId]}>{m[COL.matId]} · {m[COL.d1]} {m[COL.d2] ? "· " + m[COL.d2] : ""}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9584]" />
                    </div>
                    {opciones.length === 0 && <p className="sans text-[11px] text-[#B4552F] mt-1">Sin materiales disponibles en esta categoría (revisa Visible_en_App / stock).</p>}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-[#EFEAE0] space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="sans text-sm text-[#2A2A2A]">Incluir instalación</span>
                <span className="flex items-center gap-2">
                  <span className="sans text-sm text-[#6B6455]">{clp(prodInfo?.instalacion || 0)}</span>
                  <input type="checkbox" checked={form?.instalacion || false} onChange={(e) => setForm((f) => ({ ...f, instalacion: e.target.checked }))} className="w-4 h-4 accent-[#12213E] cursor-pointer" />
                </span>
              </label>
              {prodInfo && !prodInfo.tieneInstalacion && (
                <div className="sans text-xs rounded-md px-3 py-2 flex items-center gap-2" style={{ background: "#FBEFE7", border: "1px solid #F0D9C8", color: "#8C3F22" }}>
                  <AlertTriangle size={13} className="shrink-0" /> Este producto no tiene precio de instalación en CONFIGURACIÓN. Se usará $0.
                </div>
              )}
              {adicionales.map((adi) => (
                <label key={adi[COL.adiId]} className="flex items-center justify-between cursor-pointer">
                  <span className="sans text-sm text-[#2A2A2A]">{adi[COL.adiDesc]}</span>
                  <span className="flex items-center gap-2">
                    <span className="sans text-sm text-[#6B6455]">{clp(Number(adi[COL.adiPrecio]) || 0)}</span>
                    <input type="checkbox" checked={form?.adicionales.includes(adi[COL.adiId])} onChange={() => toggleAdic(adi[COL.adiId])} className="w-4 h-4 accent-[#12213E] cursor-pointer" />
                  </span>
                </label>
              ))}
            </div>

            {!camposCompletos && form && (form.ancho || form.alto || Object.values(form.selecciones).some(Boolean)) && (
              <p className="sans text-xs text-[#B4552F] mt-4 bg-[#FBEFE7] border border-[#F0D9C8] rounded-md px-3 py-2">Falta: {faltantes.join(", ")}</p>
            )}
            {previewActual && (
              <div className="mt-4 flex items-center justify-between bg-[#F7F4EE] rounded-md px-4 py-3">
                <span className="sans text-xs caps text-[#6B6455]">Esta cortina (costo sin margen ni IVA)</span>
                <span className="sans text-lg font-semibold text-[#12213E]">{clp(previewActual.subtotal)}</span>
              </div>
            )}
            <button onClick={agregarCortina} disabled={!camposCompletos}
              className="sans mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: camposCompletos ? "#12213E" : "#D8D2C2", color: camposCompletos ? "#F7F4EE" : "#6B6455" }}>
              <Plus size={17} /> Agregar cortina a la cotización
            </button>
          </section>

          {/* CORTINAS */}
          {cortinas.length > 0 && calculo && (
            <section className="bg-white rounded-lg border border-[#E4DFD3] shadow-sm p-5 sm:p-6">
              <h2 className="sans text-[11px] caps text-[#12213E] font-semibold mb-4">Cortinas en esta cotización ({cortinas.length})</h2>
              <div className="space-y-2">
                {calculo.desg.map((d, i) => {
                  const c = cortinas.find((x) => x.id === d.id);
                  const abierta = cortinaAbierta === d.id;
                  const telaKey = Object.keys(c.selecciones).find((k) => k.includes("tela"));
                  const telaMat = telaKey ? materialesPorId[c.selecciones[telaKey]] : null;
                  return (
                    <div key={d.id} className="border border-[#EFEAE0] rounded-md overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#FBFAF6]">
                        <button onClick={() => setCortinaAbierta(abierta ? null : d.id)} className="sans flex items-center gap-2 text-sm text-[#2A2A2A] text-left flex-1">
                          {abierta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span className="font-medium">#{i + 1}</span>
                          <span className="text-[#6B6455]">{c.producto} · {c.ancho}×{c.alto} cm{telaMat ? " · " + telaMat[COL.d1] : ""}</span>
                        </button>
                        <span className="sans text-sm font-semibold text-[#12213E] mr-3">{clp(d.subtotal)}</span>
                        <button onClick={() => duplicar(d.id)} title="Duplicar" className="text-[#6B6455] hover:text-[#12213E] mr-2"><Files size={15} /></button>
                        <button onClick={() => quitar(d.id)} title="Eliminar" className="text-[#B4552F]"><Trash2 size={15} /></button>
                      </div>
                      {abierta && (
                        <div className="px-4 py-3 space-y-1.5 bg-white">
                          {d.lineas.map((l, idx) => (
                            <div key={idx} className="sans flex justify-between text-xs">
                              <span className={l.tipo === "auto" ? "text-[#9C9584] italic" : "text-[#4A453B]"}>{l.label}</span>
                              <span className="text-[#4A453B]">{clp(l.costo)}</span>
                            </div>
                          ))}
                          {d.instalacion > 0 && (
                            <div className="sans flex justify-between text-xs pt-1.5 mt-1.5 border-t border-[#EFEAE0]">
                              <span className="text-[#4A453B]">Instalación</span><span className="text-[#4A453B]">{clp(d.instalacion)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CARGOS MANUALES */}
          <section className="bg-white rounded-lg border border-[#E4DFD3] shadow-sm p-5 sm:p-6">
            <h2 className="sans text-[11px] caps text-[#12213E] font-semibold mb-1">Cargos manuales</h2>
            <p className="sans text-xs text-[#9C9584] mb-4">Se aplican después del margen, antes del IVA.</p>
            {cargos.length > 0 && (
              <div className="space-y-2 mb-4">
                {cargos.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-[#F7F4EE] rounded-md px-3 py-2">
                    <div className="sans text-xs"><span className="font-medium text-[#2A2A2A]">{c.desc}</span>{c.obs && <span className="text-[#9C9584]"> — {c.obs}</span>}</div>
                    <div className="flex items-center gap-2">
                      <span className={"sans text-sm font-semibold " + (c.signo === "suma" ? "text-[#2F6B4F]" : "text-[#B4552F]")}>{c.signo === "suma" ? "+" : "−"}{clp(c.monto)}</span>
                      <button onClick={() => quitarCargo(c.id)} className="text-[#B4A99A]"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_84px_40px] gap-2 items-end">
              <label className="block"><span className="sans text-[11px] text-[#9C9584] block mb-1">Descripción</span>
                <input value={nuevoCargo.desc} onChange={(e) => setNuevoCargo((c) => ({ ...c, desc: e.target.value }))} placeholder="Distancia" className="sans w-full text-sm px-2.5 py-2 rounded-md border border-[#D8D2C2] focus:border-[#12213E] focus:outline-none" /></label>
              <label className="block"><span className="sans text-[11px] text-[#9C9584] block mb-1">Observación</span>
                <input value={nuevoCargo.obs} onChange={(e) => setNuevoCargo((c) => ({ ...c, obs: e.target.value }))} placeholder="Traslado" className="sans w-full text-sm px-2.5 py-2 rounded-md border border-[#D8D2C2] focus:border-[#12213E] focus:outline-none" /></label>
              <label className="block"><span className="sans text-[11px] text-[#9C9584] block mb-1">Monto</span>
                <input type="number" value={nuevoCargo.monto} onChange={(e) => setNuevoCargo((c) => ({ ...c, monto: e.target.value }))} placeholder="15000" className="sans w-full text-sm px-2.5 py-2 rounded-md border border-[#D8D2C2] focus:border-[#12213E] focus:outline-none" /></label>
              <div className="block"><span className="sans text-[11px] text-[#9C9584] block mb-1">Tipo</span>
                <div className="flex rounded-md overflow-hidden border border-[#D8D2C2]">
                  <button onClick={() => setNuevoCargo((c) => ({ ...c, signo: "suma" }))} className={"sans flex-1 text-xs py-2 " + (nuevoCargo.signo === "suma" ? "bg-[#2F6B4F] text-white" : "bg-white text-[#6B6455]")}>+</button>
                  <button onClick={() => setNuevoCargo((c) => ({ ...c, signo: "resta" }))} className={"sans flex-1 text-xs py-2 " + (nuevoCargo.signo === "resta" ? "bg-[#B4552F] text-white" : "bg-white text-[#6B6455]")}>−</button>
                </div>
              </div>
              <button onClick={agregarCargo} className="h-[38px] rounded-md flex items-center justify-center text-white" style={{ background: "#12213E" }}><Plus size={16} /></button>
            </div>
          </section>

          {/* RENTABILIDAD INTERNA */}
          {calculo && (
          <section className="bg-white rounded-lg border border-[#E4DFD3] shadow-sm p-5 sm:p-6">
            <h2 className="sans text-[11px] caps text-[#12213E] font-semibold mb-1">Rentabilidad interna</h2>
            <p className="sans text-xs text-[#9C9584] mb-4">Salen de tu margen bruto — no afectan el precio al cliente.</p>
            {[{ key: "comision", label: "Comisión de venta" }, { key: "gastosOp", label: "Gastos operativos" }, { key: "fondoReserva", label: "Fondo de reserva" }].map((row) => (
              <div key={row.key} className="flex items-center gap-2 mb-3">
                <span className="sans text-sm text-[#2A2A2A] flex-1">{row.label}</span>
                <div className="flex rounded-md overflow-hidden border border-[#C4BDA9]" style={{ background: "#EDE9DF" }}>
                  <button onClick={() => setDed((d) => ({ ...d, [row.key]: { ...d[row.key], mode: "pct" } }))} className="sans text-sm font-semibold px-3 py-1.5" style={{ background: ded[row.key].mode === "pct" ? "#12213E" : "transparent", color: ded[row.key].mode === "pct" ? "#fff" : "#8A8266" }}>%</button>
                  <button onClick={() => setDed((d) => ({ ...d, [row.key]: { ...d[row.key], mode: "clp" } }))} className="sans text-sm font-semibold px-3 py-1.5" style={{ background: ded[row.key].mode === "clp" ? "#12213E" : "transparent", color: ded[row.key].mode === "clp" ? "#fff" : "#8A8266" }}>$</button>
                </div>
                <input type="number" value={ded[row.key].value} onChange={(e) => setDed((d) => ({ ...d, [row.key]: { ...d[row.key], value: e.target.value } }))} className="sans w-20 text-sm px-2 py-1.5 rounded-md border border-[#D8D2C2] focus:border-[#12213E] focus:outline-none text-right" />
                <span className="sans text-xs text-[#6B6455] w-[72px] text-right">−{clp(calculo.dedMontos[row.key])}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-[#EFEAE0] space-y-1.5">
              <div className="flex justify-between sans text-xs text-[#6B6455]"><span>Margen bruto</span><span>{clp(calculo.margenValor)}</span></div>
              <div className="flex justify-between sans text-xs text-[#B4552F]"><span>− Deducciones internas</span><span>−{clp(calculo.dedTotal)}</span></div>
              <div className="flex justify-between sans text-sm font-semibold" style={{ color: calculo.margenNeto >= 0 ? "#2F6B4F" : "#B4552F" }}><span>Margen neto real</span><span>{clp(calculo.margenNeto)}</span></div>
            </div>
            {calculo.margenValor > 0 && calculo.margenNeto < calculo.margenValor * 0.15 && (
              <p className="sans text-xs text-[#B4552F] mt-3 bg-[#FBEFE7] border border-[#F0D9C8] rounded-md px-3 py-2">⚠ El margen neto quedó muy bajo tras las deducciones.</p>
            )}
          </section>
          )}
        </div>

        {/* RESUMEN STICKY */}
        {calculo && (
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <section className="rounded-lg shadow-md overflow-hidden" style={{ background: "#12213E" }}>
            <div className="p-5 sm:p-6">
              <p className="sans text-[11px] caps text-[#C7CEDB] mb-1">Total cotización</p>
              <p className="text-3xl sm:text-4xl text-white tracking-tight">{clp(calculo.totalFinal)}</p>
              <p className="sans text-xs text-[#B4BDCC] mt-1">{cortinas.length} {cortinas.length === 1 ? "cortina" : "cortinas"} · IVA incluido</p>
            </div>
            <div className="px-5 sm:px-6 pb-5">
              <label className="block mb-4">
                <div className="flex items-center justify-between mb-1.5"><span className="sans text-xs text-[#C7CEDB]">Margen</span><span className="sans text-sm text-white font-semibold">{margen}%</span></div>
                <input type="range" min="0" max="80" step="1" value={margen} onChange={(e) => setMargen(Number(e.target.value))} className="w-full accent-[#C9A24B] cursor-pointer" />
              </label>
              <button onClick={() => setShowDesglose((s) => !s)} className="sans w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-xs caps" style={{ border: "1px solid #3D5080", color: "#D9B96A", background: "transparent" }}>
                <Calculator size={14} color="#D9B96A" /> {showDesglose ? "Ocultar desglose" : "Ver desglose interno"}
              </button>
            </div>
            {showDesglose && (
              <div className="bg-[#0D1830] px-5 sm:px-6 py-4 space-y-2 border-t border-[#2C3E63]">
                <Fila label="Total cortinas (variable + instalación)" val={calculo.totalCortinas} />
                <Fila label={"Margen (" + margen + "%)"} val={calculo.margenValor} />
                <Fila label="Subtotal con margen" val={calculo.subtotalConMargen} bold />
                <Fila label="Cargos manuales" val={calculo.cargosNet} signed />
                <Fila label="Subtotal antes de IVA" val={calculo.subtotalAntesIva} bold />
                <Fila label="IVA (19%)" val={calculo.iva} />
                <div className="pt-2 mt-1 border-t border-[#2C3E63]"><Fila label="TOTAL FINAL" val={calculo.totalFinal} bold big /></div>
              </div>
            )}
          </section>
          {cortinas.length === 0 && (
            <div className="sans text-xs text-[#9C9584] bg-white border border-[#E4DFD3] rounded-lg p-4 flex gap-2">
              <ScrollText size={15} className="shrink-0 mt-0.5" /><span>Ingresa medidas, elige los materiales y pulsa "Agregar cortina".</span>
            </div>
          )}
        </div>
        )}
      </main>

      <footer className="sans text-center text-[11px] text-[#9C9584] pb-8">Luxor Group SpA · Costeador {enVivo ? "· datos en vivo" : "· datos de respaldo"}</footer>
    </div>
  );
}

function Fila({ label, val, bold, big, signed }) {
  const color = signed && val < 0 ? "#E8A87C" : signed && val > 0 ? "#9FD8B5" : bold ? "#F7F4EE" : "#C7CEDB";
  return (
    <div className="flex items-center justify-between">
      <span className={"sans " + (big ? "text-sm" : "text-xs")} style={{ color: bold ? "#F7F4EE" : "#C7CEDB" }}>{label}</span>
      <span className={"sans " + (big ? "text-lg font-semibold" : "text-xs")} style={{ color, fontWeight: bold ? 600 : 400 }}>{signed && val >= 0 ? "+" : ""}{val < 0 ? "−" : ""}{clp(Math.abs(val))}</span>
    </div>
  );
}
