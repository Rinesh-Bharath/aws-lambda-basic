# api-product

# Input

1.

```
{
	"action": "create_product",
	"body": {
		"input": {
			"user_id": "4b6d9b3a-8d4a-4a88-be57-fcd225daab52",
			"name": "sample product"
		}
	}
}
```

2.

```
{
	"action": "read_product",
	"body": {
		"input": {
			"product_id": "85034f29-8324-48b9-b617-5ca408e03d9f"
		}
	}
}
```

```
{
	"service": "api-product",
	"data": {
		"_id": "6090058e78fc3d5858a739ee",
		"product_id": "85034f29-8324-48b9-b617-5ca408e03d9f",
		"status": "INACTIVE",
		"name": "Chicken Pizza",
		"price": 160,
		"color": "Yellow",
		"audit": {
			"created_by": "f4a276e5-f470-4f85-b0ec-a48c5c380a72",
			"created_at": "2021-05-03T14:15:40.962Z",
			"updated_by": "f4a276e5-f470-4f85-b0ec-a48c5c380a72",
			"updated_at": "2021-05-03T14:15:40.962Z"
		}
	}
}
```

## run instructions

npm i
npm run gulp
npm run mock
