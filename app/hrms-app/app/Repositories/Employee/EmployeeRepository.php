<?php

namespace App\Repositories\Employee;

use App\Models\Employee;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

class EmployeeRepository extends BaseRepository implements EmployeeRepositoryInterface
{
    public function __construct(Employee $model)
    {
        parent::__construct($model);
    }

    public function findByDepartment(string $departmentId): Collection
    {
        return $this->model->where('department_id', $departmentId)->get();
    }
}
