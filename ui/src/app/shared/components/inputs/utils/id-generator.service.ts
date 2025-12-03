import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorService {

  public gerarId(label: string): string {
    if (!label) 
      return 'input-id' 
    
    return label
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '')
      .replace(/-+/g, '')
      + '-input-id'
  }
}
