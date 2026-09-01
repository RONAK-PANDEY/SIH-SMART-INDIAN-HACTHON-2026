# SmartCare API Contracts & Specifications
> **Maintainer**: Arpan  
> **Mandatory**: All developers must adhere to these schemas before writing frontend or service modules.

## 1. Authentication Endpoints
`POST /api/v1/auth/register`
`POST /api/v1/auth/login`

## 2. Queue Endpoints
`POST /api/v1/appointments/tokens/generate`
`WS /api/v1/ws/queue/{hospital_id}/{department_id}`
