//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();

const format = (resultRow) =>
    `isbn: {${resultRow.isbn13}} - author: [${resultRow.authors}] - publish year: [${resultRow.publication_year}] - original title: [${resultRow.original_title}]
    - title: [${resultRow.title}] - Average Rating: [${resultRow.rating_avg}] - Rating Count: [${resultRow.rating_count}] - 
    Image URL: [${resultRow.image_url}]`;

bookRouter.get('/getAll', (request: Request, response: Response) => {
    const theQuery = 'SELECT * FROM books';
    pool.query(theQuery)
        .then((result) => {
            response.status(200).send({
                entries: result.rows.map(format),
            });
        })
        .catch((error) => {
            console.error('DB Query error on GET all');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});

export { bookRouter };
