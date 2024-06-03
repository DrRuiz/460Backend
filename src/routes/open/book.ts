//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions, format } from '../../core/utilities';
import {IJwtRequest} from "../../core/models";

const bookRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

const allButId =
    'SELECT isbn13, authors, publication_year, original_title, title, rating_avg, rating_count,' +
    ' rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url,' +
    ' image_small_url FROM books ';

/**
 * @api {get} /book Request to retrieve all books using pagination.
 *
 * @apiDescription Request to get all entries of all books that fit within the number of books per page, and that are located in the specified page.
 *
 * @apiName GetAllBooks
 * @apiGroup Book
 *
 * @apiQuery {int} pagenum The page number of the page to select
 * @apiQuery {int} perpage The number of books that each page will have
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
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
 * @apiError (400 Input outside of range) {String} message "Both values per page and page number must be greater than 0.",
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (400: Page outside of range) {String} message "Page must be greater than 0 and less than <code>maxPages</code>."
 */
bookRouter.get(
    '/getAll',
    (request: Request, response: Response, next: NextFunction) => {
        if (
            isNumberProvided(request.query.pagenum) &&
            isNumberProvided(request.query.perpage)
        ) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },
    (request: Request, response: Response) => {
        const pageNum: string = request.query.pagenum as string;
        const perPage: string = request.query.perpage as string;
        const intPageNum = parseFloat(pageNum);
        const intPerPage = parseFloat(perPage);

        const query = 'SELECT MAX(id) FROM books';
        const values = [];
        pool.query(query, values).then((result) => {
            let maxBook: number;
            result.rows.map((resultRow) => {
                maxBook = resultRow.max;
            });
            const maxPages = Math.ceil(maxBook / intPerPage);

            if (intPageNum < 1 || intPerPage < 1) {
                response.statusMessage = 'Input outside of range';
                response.status(400).send({
                    message:
                        'Both values per page and page number must be greater than 0.',
                });
            } else if (maxPages < intPageNum || maxPages < 1) {
                response.statusMessage = 'Page outside of range';
                response.status(400).send({
                    message:
                        'Page must be greater than 0 and less than ' +
                        maxPages +
                        '.',
                });
            } else {
                // The last value in the page we selected
                const maxInPage = intPerPage * intPageNum;
                const maxIndex = maxInPage > maxBook ? maxBook : maxInPage;
                const minIndex = intPerPage * (intPageNum - 1) + 1;

                const innerQuery =
                    'SELECT * FROM books WHERE id >= $1 AND id <= $2';
                const values = [minIndex, maxIndex];
                pool.query(innerQuery, values)
                    .then((innerResult) => {
                        response.status(200).send({
                            entries: innerResult.rows.map(format),
                        });
                    })
                    .catch(() => {
                        response.status(500).send({
                            message: 'Server error - contact support',
                        });
                    });
            }
        });
    }
);

/**
 * @api {get} /book/author Request to retrieve books by author
 *
 * @apiDescription Request to get all entries related to the books with the provided author
 *
 * @apiName GetBooksByAuthor
 * @apiGroup Book
 *
 * @apiQuery {string} author The name of the author whose books to retrieve
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
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
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: No books found) {String} message "No books with this author were found in the database."
 */
bookRouter.get(
    '/author',
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
    (request: Request, response: Response, next: NextFunction) => {
        const query = 'SELECT authors FROM books WHERE authors LIKE $1';
        const values = [`%${request.query.author}%`];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    next();
                } else {
                    response.statusMessage = 'No books found';
                    response.status(404).send({
                        message:
                            'No books with this author were found in the database.',
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
        const query = allButId + 'WHERE authors LIKE $1';
        const values = [`%${request.query.author}%`];
        pool.query(query, values)
            .then((result) => {
                response.status(200).send({
                    entries: result.rows.map(format),
                });
            })
            .catch(() => {
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);

/**
 * @api {get} /book/singlerating Request to retrieve books by rating.
 *
 * @apiDescription Request to get all entries related to the books that have the provided average rating.
 *
 * @apiName GetBooksByRating
 * @apiGroup Book
 *
 * @apiQuery {int} rating The average rating (0-5] of the books to retrieve
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
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
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (404: No books found) {String} message "No books with this rating were found."
 * @apiError (400: Rating out of range) {String} message "Rating should be between 0.0 and 5.0."
 */
bookRouter.get(
    '/singlerating',
    (request: Request, response: Response, next: NextFunction) => {
        if (isNumberProvided(request.query.rating)) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        const rating: string = request.query.rating as string;
        if (parseFloat(rating) > 0 && parseFloat(rating) <= 5) {
            next();
        } else {
            response.statusMessage = 'Rating out of range';
            response.status(400).send({
                message: 'Rating should be between 0.0 and 5.0.',
            });
        }
    },
    (request: Request, response: Response) => {
        const query = allButId + 'WHERE rating_avg = $1';
        const values = [request.query.rating];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'No books found';
                    response.status(404).send({
                        message: 'No books with this rating were found.',
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
 * @apiName GetAvgRatingRange
 * @apiGroup Book
 *
 * @apiQuery {int} min The minimum average rating to select
 * @apiQuery {int} max The maximum average rating to select
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
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
 * @apiError (400: Missing information) {String} message "Missing data, refer to documentation."
 * @apiError (404: Book title does not exist) {String} message "Book title not found in database."
 */
bookRouter.get(
    '/title',
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.query.title)) {
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
                        message: 'Book title not found in database.',
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

//max start #############
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
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (400: Year is in the future) {String} message "Cannot input a future year."
 * @apiError (404: No books in this year) {String} message "No books found in this year."
 */
bookRouter.get(
    '/year',
    (request: Request, response: Response, next: NextFunction) => {
        if (isNumberProvided(request.query.year)) {
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

        if (parseInt(year) > currentYear) {
            response.statusMessage = 'Year is in the future';
            response.status(400).send({
                message: 'Cannot input a future year.',
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

//max end #############

//Ryan Start ########################

/**
 * @api {get} /book/isbn Request for the book with a given ISBN
 *
 * @apiDescription Request for the book with a given ISBN
 *
 * @apiName getBooksISBN
 * @apiGroup Book
 *
 * @apiQuery {int} isbn The ISBN to get the book for (13 digits)
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
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
 *
 * @apiError (400: Missing/Bad information) {String} message "Missing or bad information, see documentation."
 * @apiError (404: No books matching this ISBN) {String} message "No books found matching this ISBN."
 */
bookRouter.get(
    '/isbn',
    (request: Request, response: Response, next: NextFunction) => {
        if (isNumberProvided(request.query.isbn) && (request.query.isbn.length == 13)) {
            next();
        } else {
            response.statusMessage = 'Missing/Bad information';
            response.status(400).send({
                message: 'Missing or bad information, see documentation.',
            });
        }
    },

    (request: Request, response: Response) => {
        const query = allButId + 'WHERE isbn13 = $1';
        const values = [request.query.isbn];
        pool.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.status(200).send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.statusMessage = 'No books with this ISBN';
                    response.status(404).send({
                        message: 'No books found with this ISBN.',
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
 * @api {post} /adminBook/addBook Request to add a book.
 *
 * @apiDescription Request to add a book with author name, isbn, publication year, and book title.
 *
 * @apiName AddBook
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
 * @apiError (400: Missing information) {String} message "Missing required information, see documentation."
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN, use a nonnegative number."
 * @apiError (400: Invalid year) {String} message "Invalid year, use a number."
 * @apiError (400: Invalid average rating) {String} message "Invalid average rating, use a number 0-5."
 * @apiError (400: Invalid total rating count) {String} message "Invalid total rating count, use a nonnegative number."
 * @apiError (400: Invalid star ratings) {String} message "Invalid star ratings, use nonnegative numbers."
 * @apiError (400: Book already exists) {String} message "Book already exists in database."
 */


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
bookRouter.post(
    '/addBook',
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

//Ryan End ########################

export { bookRouter };
