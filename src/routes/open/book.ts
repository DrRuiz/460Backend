//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import {
    pool,
    validationFunctions,
    IBook,
    IRatings,
    IUrlIcon,
} from '../../core/utilities';

const bookRouter: Router = express.Router();
const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

const allButId =
    'SELECT isbn13, authors, publication_year, original_title, title, rating_avg, rating_count,' +
    ' rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url,' +
    ' image_small_url FROM books ';

const format = (resultRow) => {
    const out: IBook = {
        isbn13: resultRow.isbn13 as number,
        authors: resultRow.authors as string,
        publication: resultRow.publication_year as number,
        original_title: resultRow.original_title as string,
        title: resultRow.title as string,
        ratings: {
            average: resultRow.rating_avg as number,
            count: resultRow.rating_count as number,
            rating_1: resultRow.rating_1_star as number,
            rating_2: resultRow.rating_2_star as number,
            rating_3: resultRow.rating_3_star as number,
            rating_4: resultRow.rating_4_star as number,
            rating_5: resultRow.rating_5_star as number,
        } as IRatings,
        icons: {
            large: resultRow.image_url as string,
            small: resultRow.image_small_url as string,
        } as IUrlIcon,
    };
    return out;
};

/**
 * @api {get} /book Request to retrieve all books
 *
 * @apiDescription Request to get all entries of all books
 *
 * @apiName GetAllBooks
 * @apiGroup Book
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
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
 */
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

/**
 * @api {get} /book Request to retrieve books by author
 *
 * @apiDescription Request to get all entries related to the books with the provided <code>author</code>
 *
 * @apiName GetBooksByAuthor
 * @apiGroup Book
 *
 * @apiQuery {string} author The name of the author whose books to retrieve
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
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
 * @apiError (404: no books found) {String} message "No books with this <code>author</code> were found"
 */
// bookRouter.get('/:author', (request: Request, response: Response) => {
//     const theQuery = 'SELECT name, message, priority FROM Books WHERE = $1';
//     const author = request.query.author;
// });

/**
 * @api {get} /book Request to retrieve books by rating
 *
 * @apiDescription Request to get all entries related to the books that have the provided <code>rating</code>
 *
 * @apiName GetBooksByRating
 * @apiGroup Book
 *
 * @apiQuery {int} rating The rating [0-5] of the books to retrieve
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
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
 */

//Riley methods start here #########################################

/**
 * @api {get} /book/authortitle Request for an author's book
 *
 * @apiDescription Request for the specified book title by the specified author
 *
 * @apiName GetBooksAuthorTitle
 * @apiGroup Book
 *
 * @apiQuery {String} author The author's name
 * @apiQuery {String} title The title of the book
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
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
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: Author does not exist) {String} message "Author does not exist in database."
 * @apiError (404: Book does not exist) {String} message "Book title does not exist in database."
 * @apiError (400: Book and Author do not match) {String} message "Book not written by specified author."
 */
bookRouter.get(
    '/authortitle',
    (request: Request, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.query.author) &&
            isStringProvided(request.query.title)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing information';
            response.status(400).send({
                message: 'Missing data, refer to documentation.',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        const query = 'SELECT authors FROM books WHERE authors LIKE $1';
        const values = [`%${request.query.author}%`];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.statusMessage = 'Author does not exist';
                    response.status(404).send({
                        message: 'Author does not exist in database.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    },
    (request: Request, response: Response, next: NextFunction) => {
        const query = 'SELECT title FROM books WHERE title LIKE $1';
        const values = [`%${request.query.title}%`];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.statusMessage = 'Book does not exist';
                    response.status(404).send({
                        message: 'Book title does not exist in database.',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    },
    (request: Request, response: Response) => {
        const query = allButId + 'WHERE authors LIKE $1 AND title LIKE $2';
        const values = [
            `%${request.query.author}%`,
            `%${request.query.title}%`,
        ];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'Book and Author do not match';
                    response.status(400).send({
                        message: 'Book not written by specified author.',
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

/**
 * @api {get} /book/ratings Request for books in a range of ratings.
 *
 * @apiDescription Request for all books with an average rating between the min and max values, inclusive.
 *
 * @apiName getAvgRatingRange
 * @apiGroup Book
 *
 * @apiQuery {int} min The minimum average rating to select
 * @apiQuery {int} max The maximum average rating to select
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
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
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (400: Out of range) {String} message "Ratings should be between 0.0 and 5.0"
 * @apiError (400: Min greater than max) {String} message "Minimum rating should be less than maximum rating."
 * @apiError (404: No books in range) {String} message "No books found in this rating range."
 */
bookRouter.get(
    '/ratings',
    (request: Request, response: Response, next: NextFunction) => {
        if (
            isNumberProvided(request.query.min) &&
            isNumberProvided(request.query.max)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        const min: string = request.query.min as string;
        const max: string = request.query.max as string;
        if (parseFloat(min) < 0 || parseFloat(max) > 5) {
            response.statusMessage = 'Out of range';
            response.status(400).send({
                message: 'Ratings should be between 0.0 and 5.0',
            });
        } else if (parseFloat(max) < parseFloat(min)) {
            response.statusMessage = 'Min greater than max';
            response.status(400).send({
                message: 'Minimum rating should be less than maximum rating.',
            });
        } else {
            next();
        }
    },
    (request: Request, response: Response) => {
        const query = allButId + 'WHERE rating_avg >= $1 AND rating_avg <= $2';
        const values = [request.query.min, request.query.max];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'No books in range';
                    response.status(404).send({
                        message: 'No books found in this rating range.',
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

//Max methods start here #########################################
/**
 * @api {get} /book/title Request for books with title containing search term
 *
 * @apiDescription Request for the specified book title
 *
 * @apiName GetBooksTitle
 * @apiGroup Book
 *
 * @apiQuery {String} title The title of the book
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
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
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: Book does not exist) {String} message "Book title does not exist in database."
 */
bookRouter.get(
    '/title',
    (request: Request, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.query.title)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing information';
            response.status(400).send({
                message: 'Missing data, refer to documentation.',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        const query = allButId + 'WHERE title LIKE $1';
        const values = [`%${request.query.title}%`];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'Book title does not exist';
                    response.status(404).send({
                        message: 'Book title not found in database',
                    });
                }
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    },
);


/**
 * @api {get} /book/year Request for books in a given year
 *
 * @apiDescription Request for all books in a given year
 *
 * @apiName getBooksYear
 * @apiGroup Book
 *
 * @apiQuery {int} year The year to get books for
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
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
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (404: No books in range) {String} message "No books found in this year."
 */
bookRouter.get(
    '/year',
    (request: Request, response: Response, next: NextFunction) => {
        if (
            isNumberProvided(request.query.year)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },

    (request: Request, response: Response, next: NextFunction) => {
        const year: string = request.query.year as string;
        const currentYear: number = new Date().getFullYear();

        if (parseInt(year) < 0){
            response.statusMessage = 'Year is negative';
            response.status(400).send({
                message: 'Year cannot be negative',
        });
        } else if (parseInt(year) > currentYear){
            response.statusMessage = 'Year is in the future';
            response.status(400).send({
                message: 'Cannot input a future year',
        });
        } else {
            next();
        } 
    },
    (request: Request, response: Response) => {
        const query = allButId + 'WHERE publication_year = $1';
        const values = [request.query.year];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'No books in this year';
                    response.status(404).send({
                        message: 'No books found in this year.',
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

export { bookRouter };
