import { Db } from './db';

export namespace Tree {
  /** @returns Whether the {@link id} exists. */
  export function isValidId(id: number): boolean {
    return id === 1 || Db.read().map[String(id)] !== undefined;
  }

  export function read(): Db.Tree {
    return Db.read().tree;
  }

  export type UpdateTreeInput = Readonly<{
    label: string;
    parentId: number;
  }>;

  export function update(input: UpdateTreeInput): void {
    const struct = Db.read();
    const id = ++struct.lastId;
    struct.map[String(id)] = input.parentId;
    insert({
      node: { id, label: input.label, children: [] },
      tree: struct.tree,
      path: readPath({ id, map: struct.map }),
    });
    Db.write(struct);
  }

  type ReadPathInput = Readonly<{
    /** The {@link Db.Node.id} to be inserted. */
    id: number;
    map: Db.TreeMap;
  }>;

  /**
   * The sequence of IDs (in reverse order) to get to where the {@link node} must be inserted in the {@link tree}.
   *
   * @example
   * Given the following {@link node} whose parent {@link Db.Node.id} is `4`:
   *
   * ```
   * { id: 5, label: "label", children: [] }
   * ```
   *
   * When the following is the {@link tree}:
   * ```
   * [
   *   {
   *     id: 1,
   *     label: "root",
   *     children: [
   *       {
   *         id: 3,
   *         label: "bear",
   *         children: [
   *           {
   *             id: 4,
   *             label: "cat",
   *             children: [],
   *           }
   *         ]
   *       },
   *       {
   *         id: 7,
   *         label: "frog",
   *         children: [],
   *       },
   *     ],
   *   },
   * ]
   * ```
   *
   * Then this will be:
   *
   * ```
   * [ 4, 3, 1 ]
   * ```
   */
  type Path = number[];

  function readPath({ id, map }: ReadPathInput): Path {
    const path = Array<number>();
    let lastId: number | undefined = id;
    while (true) {
      lastId = map[String(lastId)];
      if (lastId === undefined) break;
      path.push(lastId);
    }
    return path;
  }

  type InsertInput = Readonly<{
    /** Must not exist in the {@link tree}. */
    node: Db.Node;
    tree: Db.Tree;
    path: Path;
  }>;

  /** Inserts the {@link InsertInput.node} in the {@link InsertInput.tree}. */
  function insert(input: InsertInput): void {
    const recurse = (children: Db.Tree, pathIndex: number): Db.Node => {
      for (const child of children)
        if (child.id === input.path[pathIndex])
          return pathIndex === 0
            ? child
            : recurse(child.children, pathIndex - 1);
      throw new Error("The relevant node wasn't found.");
    };
    const parentNode = recurse(input.tree, input.path.length - 1);
    parentNode.children.push(input.node);
  }
}
