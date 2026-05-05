import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Objeto {
    nombre: string;
    tipo: 'Xuxe' | 'Vacuna';
    cantidad: number;
    stackable: boolean;
    imagen: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
    // Estado compartido de los 20 huecos visibles de la mochila.
    private slotsSubject = new BehaviorSubject<(Objeto | null)[]>(Array(20).fill(null)); //control d huecos libres en la mochila
    slots$ = this.slotsSubject.asObservable();

    // Calculamos los huecos usados dividiendo la cantidad de apilables (xuxes) entre 5
    calculateSlotsUsed(inventory: Objeto[]): number {
        let slots = 0;
        for (const item of inventory) {
            slots += item.stackable ? Math.ceil(item.cantidad / 5) : item.cantidad;
        }
        return slots;
    }

    // Llena un array de 20 huecos. Si hay xuxes, las distribuye de 5 en 5 (apilamiento).
    organizarMochila(inventory: Objeto[]): void {
        const slots: (Objeto | null)[] = Array(20).fill(null);
        let currentSlot = 0;
        for (const item of inventory) {
            if (currentSlot >= 20) break; // Si excedemos los 20 cortamos
            if (item.stackable) {
                // Las agrupa de 5 en 5 máximo
                let remaining = item.cantidad;
                while (remaining > 0 && currentSlot < 20) {
                    const stackSize = Math.min(remaining, 5);
                    slots[currentSlot++] = { ...item, cantidad: stackSize };
                    remaining -= stackSize;
                }
            } else {
                // Vacunas y objetos no apilables ocupan 1 hueco por unidad
                for (let i = 0; i < item.cantidad && currentSlot < 20; i++) {
                    slots[currentSlot++] = { ...item, cantidad: 1 };
                }
            }
        }
        // Actualiza el BehaviorSubject para que todos los que observen cambien a la vez
        this.slotsSubject.next(slots);
    }
}
