# api-product

# Input

1.

```
{
	"action": "create_product",
	"body": {
		"input": [{
			"user_id" : "070174fc-6aad-46fd-947b-ec9c84d9de4d",
			"name": "Chicken nugget",
			"price": 140,
			"color" : "Brown"
		}]
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

3.

```
{
	"action": "update_product",
	"body": {
		"input": {
			"product_id": "85034f29-8324-48b9-b617-5ca408e03d9f",
			"price": 150
		}
	}
}
```

4.

````
{
	"action": "delete_product",
	"body": {
		"input": {
			"product_id": "102cf512-ef38-44f9-b249-743bc93dc601"
		}
	}
}
```

## run instructions

npm install
npm run mock
