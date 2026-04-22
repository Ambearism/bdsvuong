## Using Docker and Makefile

### Development environment - for doing testing

```
make build-development
make start-development
```

Open http://localhost

### Staging environment - for doing UAT testing

```
make build-staging
make start-staging
```

Open http://localhost

### Production environment - for users

```
make build-production
make start-production
```

Open http://localhost

## Running Locally

First, run the development server:

```bash
make start-local
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.
