// Interfaz para representar un Xuxemon del catálogo
export interface IXuxemon {
    id: number;
    nombre: string;
    tipo: string;
    descripcion?: string;
    imagen?: string;
    imagen_pequena?: string;
    imagen_mediana?: string;
    imagen_grande?: string;
    tamano: string;
    desbloqueado?: boolean;
    bloqueado?: boolean;
    created_at?: string;
    updated_at?: string;
    comidas?: number;
    enfermedad?: string;
}
