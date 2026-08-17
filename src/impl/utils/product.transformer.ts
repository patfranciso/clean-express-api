import _ from "lodash";

import { Transformer } from "@/application/utils/transformer";
import { Product } from "@/application/entities/product";
import { docToEntity } from "@/utils/mappers";

export const transformProduct: Transformer<Product> = (product) => {
  const privateFields: Array<keyof Product> = ["createdAt", "updatedAt"];
  return _.omit(product, privateFields);
};

// export const transformProduct: Transformer<Product> = (product) => {
//   return docToEntity<Product>(product);
// };
