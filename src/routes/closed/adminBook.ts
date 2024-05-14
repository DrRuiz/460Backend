import express, { NextFunction, Request, Response, Router } from 'express';

import { pool, validationFunctions, format } from '../../core/utilities';

import { checkAdmin } from '../../core/middleware';
import { IJwtRequest } from '../../core/models';

const adminBookRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

/**
 * @api {post} /adminBook Request to add a book.
 *
 * @apiDescription Request to add a book with author name, isbn, publication year, and book title.
 *
 * @apiName postBook
 * @apiGroup AdminBook
 *
 * @apiBody {Number} isbn13 ISBN13 of the book, required
 * @apiBody {String} authors Author's name, required
 * @apiBody {Number} publication Year of publication, required
 * @apiBody {String} original_title Original title of book, optional
 * @apiBody {String} title Book title, required
 * @apiBody {Number} average Average rating of the book, optional
 * @apiBody {Number} count Total number of ratings, optional
 * @apiBody {Number} rating_1 Total number of 1 star ratings, optional
 * @apiBody {Number} rating_2 Total number of 2 star ratings, optional
 * @apiBody {Number} rating_3 Total number of 3 star ratings, optional
 * @apiBody {Number} rating_4 Total number of 4 star ratings, optional
 * @apiBody {Number} rating_5 Total number of 5 star ratings, optional
 * @apiBody {String} large URL of large version of book cover, optional
 * @apiBody {String} small URL of small version of book cover, optional
 *
 * @apiSuccess (Success 201) {String} entry The String:
 * "[isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>,
 * },]"
 *
 * @apiError (403: Forbidden) {String} message "Token is not valid" when the provided Auth token is
 * invalid for any reason.
 * @apiError (401: Unauthorized) {String} message "Auth token is not supplied" when no Auth token
 * is provided
 * @apiError (403: Invalid Privilege) message "User does not have privilege to access this route."

 * @apiError (400: Missing information) {String} message "Missing required information, see documentation."
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (400: Invalid year) {String} message "Invalid year, use a number."
 * @apiError (400: Invalid average rating) {String} message "Invalid average rating, use a number 0-5."
 * @apiError (400: Invalid total rating count) {String} message "Invalid total rating count, use a nonnegative number."
 * @apiError (400: Invalid star ratings) {String} message "Invalid star ratings, use nonnegative numbers."
 * @apiError (400: Book already exists) {String} message "Book already exists in database."
 */
adminBookRouter.post(
    '/addBook',
    checkAdmin,
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (
            (request.body.isbn13 || request.body.isbn13 == 0) &&
            request.body.authors &&
            request.body.publication &&
            request.body.title
        ) {
            next();
        } else {
            response.statusMessage = 'Missing information';
            response.status(400).send({
                message: 'Missing required information, see documentation.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.isbn13)) {
            if (parseInt(request.body.isbn13) >= 0) {
                next();
                numberTest = true;
            }
        }
        if (!numberTest) {
            response.statusMessage = 'Invalid ISBN';
            response.status(400).send({
                message: 'Invalid ISBN, use a nonnegative number.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (isNumberProvided(request.body.publication)) {
            next();
        } else {
            response.statusMessage = 'Invalid year';
            response.status(400).send({
                message: 'Invalid year, use a number.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.average) || !request.body.average) {
            const avg = !request.body.average
                ? 0
                : parseFloat(request.body.average);
            if (avg >= 0 && avg <= 5) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid average rating';
            response.status(400).send({
                message: 'Invalid average rating, use a decimal number 0-5.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.count) || !request.body.count) {
            const value = !request.body.count
                ? 0
                : parseInt(request.body.count);
            if (value >= 0) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid total rating count';
            response.status(400).send({
                message:
                    'Invalid total rating count, use a nonnegative number.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.rating_1) || !request.body.rating_1) {
            const value = !request.body.rating_1
                ? 0
                : parseInt(request.body.rating_1);
            if (value >= 0) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid star ratings';
            response.status(400).send({
                message: 'Invalid star ratings, use nonnegative numbers.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.rating_2) || !request.body.rating_2) {
            const value = !request.body.rating_2
                ? 0
                : parseInt(request.body.rating_2);
            if (value >= 0) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid star ratings';
            response.status(400).send({
                message: 'Invalid star ratings, use nonnegative numbers.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.rating_3) || !request.body.rating_3) {
            const value = !request.body.rating_3
                ? 0
                : parseInt(request.body.rating_3);
            if (value >= 0) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid star ratings';
            response.status(400).send({
                message: 'Invalid star ratings, use nonnegative numbers.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.rating_4) || !request.body.rating_4) {
            const value = !request.body.rating_4
                ? 0
                : parseInt(request.body.rating_4);
            if (value >= 0) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid star ratings';
            response.status(400).send({
                message: 'Invalid star ratings, use nonnegative numbers.',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        let numberTest = false;
        if (isNumberProvided(request.body.rating_5) || !request.body.rating_5) {
            const value = !request.body.rating_5
                ? 0
                : parseInt(request.body.rating_5);
            if (value >= 0) {
                next();
                numberTest = true;
            }
        }

        if (!numberTest) {
            response.statusMessage = 'Invalid star ratings';
            response.status(400).send({
                message: 'Invalid star ratings, use nonnegative numbers.',
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
        const query =
            'INSERT INTO books(isbn13, authors, publication_year, original_title, title, rating_avg, ' +
            'rating_count, rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url, ' +
            'image_small_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *';

        const avg = !request.body.average
            ? 0.0
            : parseFloat(request.body.average);
        const count = !request.body.count ? 0 : parseInt(request.body.count);
        const star1 = !request.body.rating_1
            ? 0
            : parseInt(request.body.rating_1);
        const star2 = !request.body.rating_2
            ? 0
            : parseInt(request.body.rating_2);
        const star3 = !request.body.rating_3
            ? 0
            : parseInt(request.body.rating_3);
        const star4 = !request.body.rating_4
            ? 0
            : parseInt(request.body.rating_4);
        const star5 = !request.body.rating_5
            ? 0
            : parseInt(request.body.rating_5);

        const values = [
            request.body.isbn13,
            request.body.authors,
            request.body.publication,
            request.body.original_title,
            request.body.title,
            avg,
            count,
            star1,
            star2,
            star3,
            star4,
            star5,
            request.body.large,
            request.body.small,
        ];

        pool.query(query, values)
            .then((result) => {
                // console.dir(result);
                response.status(201).send({
                    entry: format(result.rows[0]),
                });
            })
            .catch((error) => {
                if (
                    error.detail != undefined &&
                    (error.detail as string).endsWith('already exists.')
                ) {
                    response.statusMessage = 'Book already exists';
                    response.status(400).send({
                        message: 'Book already exists in database.',
                    });
                } else {
                    console.log(error);
                    response.status(500).send({
                        message: 'Server error - contact support',
                    });
                }
            });
    }
);

/**
 * @api {delete} /adminBook/author Request to remove books by author
 *
 * @apiDescription Request to remove all books with the specified <code>author</code>
 *
 * @apiName DeleteBooksAuthor
 * @apiGroup AdminBook
 *
 * @apiQuery {String} author The author's name
 *
 * @apiSuccess {String[]} entries Removed entries with the following format:
 * "[isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>,
 * },]"
 *
 * @apiError (403: Invalid Privilege) {String} message "User does not have privilege to access this route."
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: No books found) {String} message "No books with this author were found to delete."
 */
adminBookRouter.delete(
    '/author',
    checkAdmin,
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.query.author)) {
            next();
        } else {
            response.statusMessage = 'Missing information';
            response.status(400).send({
                message: 'Missing data, refer to documentation.',
            });
        }
    },
    (request: Request, response: Response) => {
        const query = 'DELETE FROM books WHERE authors LIKE $1 RETURNING *';
        const values = [`%${request.query.author}%`];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'No books found';
                    response.status(404).send({
                        message:
                            'No books with this author were found to delete.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);

export { adminBookRouter };
