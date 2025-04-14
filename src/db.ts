import fs from 'node:fs';
import path from 'node:path';

export namespace Db {
  export type Struct = {
    readonly map: TreeMap;
    readonly tree: Tree;
    /** Increment to get a new {@link Node.id}. */
    lastId: number;
  };

  /**
   * Maps each child {@link Node.id} (as a `string` to be JSON-compliant) to its parent's {@link Node.id}.
   * {@link Node.id} `1` is excluded because it doesn't have a parent.
   */
  export type TreeMap = Record<string, number>;

  export type Tree = Node[];

  export type Node = Readonly<{
    id: number;
    label: string;
    children: Node[];
  }>;

  let struct: Struct | null = null;
  const filePath = path.resolve(__dirname, 'db.json');

  export function read(): Struct {
    if (struct === null) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        struct = JSON.parse(fileContent) as Struct;
      } else {
        struct = {
          map: {},
          tree: [{ id: 1, label: 'root', children: [] }],
          lastId: 1,
        };
        fs.writeFileSync(filePath, JSON.stringify(struct));
      }
    }
    return struct;
  }

  export function write(struct: Struct): void {
    fs.writeFileSync(filePath, JSON.stringify(struct));
  }
}
