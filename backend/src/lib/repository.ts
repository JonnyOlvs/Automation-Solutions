import fs from "fs";

/**
 * Contrato minimo que debe cumplir cualquier fuente de datos de una entidad.
 * Hoy se implementa contra archivos JSON (FileRepository). El dia que exista
 * PostgreSQL, se escribe una PostgresRepository<T> con esta misma interfaz y
 * ningun servicio/ruta del backend necesita cambiar.
 */
export interface Repository<T> {
  findAll(): T[];
}

export class FileRepository<T> implements Repository<T> {
  private cache: T[] | null = null;

  constructor(private readonly filePath: string) {}

  findAll(): T[] {
    if (!this.cache) {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      this.cache = JSON.parse(raw) as T[];
    }
    return this.cache;
  }

  /** Fuerza a releer el archivo en el siguiente findAll() (util tras un nuevo run de Playwright). */
  invalidate(): void {
    this.cache = null;
  }
}

/** Repositorio compuesto: combina varias fuentes (ej. mock + datos reales de Playwright) bajo una sola interfaz. */
export class CompositeRepository<T> implements Repository<T> {
  constructor(private readonly sources: Array<Repository<T>>) {}

  findAll(): T[] {
    return this.sources.flatMap((source) => source.findAll());
  }
}
