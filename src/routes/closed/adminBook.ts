import express, { NextFunction, Request, Response, Router } from 'express';

import { pool, validationFunctions, format } from '../../core/utilities';

import { checkAdmin } from '../../core/middleware';
import { IJwtRequest } from '../../core/models';

const adminBookRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

function isValidIsbn(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    if (parseInt(request.body.isbn13) >= 0) {
        next();
    } else {
        response.statusMessage = 'Invalid ISBN';
        response.status(400).send({
            message: 'Invalid ISBN, use a nonnegative number.',
        });
    }
}

function isValidYear(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    const currentYear: number = new Date().getFullYear();
    if (
        isNumberProvided(request.body.publication) &&
        parseInt(request.body.publication) <= currentYear
    ) {
        next();
    } else {
        response.statusMessage = 'Invalid year';
        response.status(400).send({
            message:
                'Invalid year, use a number no greater than the current year.',
        });
    }
}

function isValidAvg(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    if (
        (parseFloat(request.body.average) >= 0 &&
            parseFloat(request.body.average) <= 5) ||
        request.body.average == null
    ) {
        next();
    } else {
        response.statusMessage = 'Invalid average rating';
        response.status(400).send({
            message: 'Invalid average rating, use a decimal number 0-5.',
        });
    }
}

function isValidCount(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    if (parseInt(request.body.count) >= 0 || request.body.count == null) {
        next();
    } else {
        response.statusMessage = 'Invalid total rating count';
        response.status(400).send({
            message: 'Invalid total rating count, use a nonnegative number.',
        });
    }
}

function isValidStars(
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) {
    let rating1 = parseInt(request.body.rating_1 ?? 0);
    rating1 = request.body.rating_1 === '' ? 0 : rating1;

    let rating2 = parseInt(request.body.rating_2 ?? 0);
    rating2 = request.body.rating_2 === '' ? 0 : rating2;

    let rating3 = parseInt(request.body.rating_3 ?? 0);
    rating3 = request.body.rating_3 === '' ? 0 : rating3;

    let rating4 = parseInt(request.body.rating_4 ?? 0);
    rating4 = request.body.rating_4 === '' ? 0 : rating4;

    let rating5 = parseInt(request.body.rating_5 ?? 0);
    rating5 = request.body.rating_5 === '' ? 0 : rating5;

    if (
        rating1 >= 0 &&
        rating2 >= 0 &&
        rating3 >= 0 &&
        rating4 >= 0 &&
        rating5 >= 0
    ) {
        next();
    } else {
        response.statusMessage = 'Invalid star ratings';
        response.status(400).send({
            message: 'Invalid star ratings, use nonnegative numbers.',
        });
    }
}
/**
 * @api {post} /adminBook/addBook Request to add a book.
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
 * @apiSuccess (Success 201) {IBook} entry The inserted book:
 * "isbn13: <code>isbn13</code>,
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
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (403: Forbidden) {String} message "Token is not valid" when the provided Auth token is
 * invalid for any reason.
 * @apiError (401: Unauthorized) {String} message "Auth token is not supplied" when no Auth token
 * is provided
 * @apiError (403: Invalid Privilege) {String} message "User does not have privilege to access this route."

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
    isValidIsbn,
    isValidYear,
    isValidAvg,
    isValidCount,
    isValidStars,
    (request: IJwtRequest, response: Response) => {
        const query =
            'INSERT INTO books(isbn13, authors, publication_year, original_title, title, rating_avg, ' +
            'rating_count, rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url, ' +
            'image_small_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *';

        const origTitle = !request.body.original_title
            ? ''
            : request.body.original_title;

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

        const largeurl = !request.body.large ? '' : request.body.large;
        const smallurl = !request.body.small ? '' : request.body.small;

        const values = [
            parseInt(request.body.isbn13),
            request.body.authors,
            parseInt(request.body.publication),
            origTitle,
            request.body.title,
            avg,
            count,
            star1,
            star2,
            star3,
            star4,
            star5,
            largeurl,
            smallurl,
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
 * @apiSuccess {IBook[]} entries Removed entries with the following format:
 * "isbn13: <code>isbn13</code>,
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
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (403: Forbidden) {String} message "Token is not valid" when the provided Auth token is
 * invalid for any reason.
 * @apiError (401: Unauthorized) {String} message "Auth token is not supplied" when no Auth token
 * is provided
 * @apiError (403: Invalid Privilege) {String} message "User does not have privilege to access this route."
 *
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: No books found) {String} message "No books with this author were found to delete."
 */
adminBookRouter.delete(
    '/author',
    checkAdmin,
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (isStringProvided(request.query.author)) {
            next();
        } else {
            response.statusMessage = 'Missing information';
            response.status(400).send({
                message: 'Missing data, refer to documentation.',
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
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
//Max start #####################
/**
 * @api {delete} /adminBook/isbn/:isbn Request to remove books by ISBN number
 *
 * @apiDescription Request to remove all books with the specified <code>isbn13</code>
 *
 * @apiName DeleteBooksByISBN
 * @apiGroup AdminBook
 *
 * @apiParam {Number} isbn ISBN13 of the book
 *
 * @apiSuccess (Success 201) {IBook} entry The removed book:
 * "isbn13: <code>isbn13</code>,
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
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (403: Forbidden) {String} message "Token is not valid" when the provided Auth token is
 * invalid for any reason.
 * @apiError (401: Unauthorized) {String} message "Auth token is not supplied" when no Auth token
 * is provided
 * @apiError (403: Invalid Privilege) {String} message "User does not have privilege to access this route."
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (404: ISBN number not found in database) {String} message "ISBN number not found in database."
 */

adminBookRouter.delete(
    '/isbn/:isbn',
    checkAdmin,
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (parseInt(request.params.isbn) >= 0) {
            next();
        } else {
            response.statusMessage = 'Invalid ISBN';
            response.status(400).send({
                message: 'Invalid ISBN, use a nonnegative number.',
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
        const query = 'DELETE FROM books WHERE isbn13 = $1 RETURNING *';
        const values = [request.params.isbn];

        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage =
                        'ISBN Number not found in database';
                    response.status(404).send({
                        message: 'ISBN Number not found in database',
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
//max end #############


//Ryan start ###################

/**
 * @api {put} /bookook/updateRating Request to change the rating for a book.
 *
 * @apiDescription Request to change the rating of a book with author name and book title.
 *
 * @apiName putBook
 * @apiGroup Book
 *
 * @apiBody {String} authors Author's name, required
 * @apiBody {String} original_title Original title of book, optional
 * @apiBody {String} title Book title, required
 * @apiBody {Number} rating The rating that the book will be updated to, required
 *
 * @apiSuccess (Success 201) {IBook} entry The book with updated rating:
 * "isbn13: <code>isbn13</code>,
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
 *     rating_5: <code>rating_5_star</code>
 * },
 * icons: {
 *     large: <code>image_url</code>,
 *     small: <code>image_small_url</code>
 * }"
 *
 * @apiError (403: Forbidden) {String} message "Token is not valid" when the provided Auth token is
 * invalid for any reason.
 * @apiError (401: Unauthorized) {String} message "Auth token is not supplied" when no Auth token
 * is provided
 * @apiError (403: Invalid Privilege) {String} message "User does not have privilege to access this route."

 * @apiError (400: Missing information) {String} message "Missing required information, see documentation."
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (400: Invalid rating) {String} message "Invalid rating, use a number 0-5."
 * 
 * @apiError (404: Author not found in database) {String} message "Author not found in database."
 * @apiError (404: Title not found in database) {String} message "Title not found in database."
 */

//Ryan end #####################

export { adminBookRouter };
