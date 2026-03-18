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
    private slotsSubject = new BehaviorSubject<(Objeto | null)[]>(Array(20).fill(null));
    slots$ = this.slotsSubject.asObservable();

    calculateSlotsUsed(inventory: Objeto[]): number {
        let slots = 0;
        for (const item of inventory) {
            slots += item.stackable ? Math.ceil(item.cantidad / 5) : item.cantidad;
        }
        return slots;
    }

    organizarMochila(inventory: Objeto[]): void {
        const slots: (Objeto | null)[] = Array(20).fill(null);
        let currentSlot = 0;
        for (const item of inventory) {
            if (currentSlot >= 20) break;
            if (item.stackable) {
                let remaining = item.cantidad;
                while (remaining > 0 && currentSlot < 20) {
                    const stackSize = Math.min(remaining, 5);
                    slots[currentSlot++] = { ...item, cantidad: stackSize };
                    remaining -= stackSize;
                }
            } else {
                for (let i = 0; i < item.cantidad && currentSlot < 20; i++) {
                    slots[currentSlot++] = { ...item, cantidad: 1 };
                }
            }
        }
        this.slotsSubject.next(slots);
    }
}
