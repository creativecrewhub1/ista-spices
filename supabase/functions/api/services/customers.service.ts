import * as customersRepo from '../repositories/customers.repo.ts'

export const CustomersService = {
  list: () => customersRepo.listWithStats(),
}
