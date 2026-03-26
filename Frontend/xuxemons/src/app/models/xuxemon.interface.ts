// Interfaz para representar un Xuxemon del catálogo
export interface IXuxemon {
    id: number;
    nombre: string;
    tipo: string;
    tamano: string;
    descripcion: string;
    imagen?: string;
    created_at?: string;
    updated_at?: string;
    enfermedad?: string;
    comidas?: number;
}
