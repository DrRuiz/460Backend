//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();

const format = (resultRow) =>
    `isbn: {${resultRow.isbn13}} - author: [${resultRow.authors}] - publish year: [${resultRow.publication_year}]` +
    ` - original title: [${resultRow.original_title}] - title: [${resultRow.title}]` +
    ` - Average Rating: [${resultRow.rating_avg}] - Rating Count: [${resultRow.rating_count}] - Image URL: [${resultRow.image_url}]`;

/**
 * @api {get} /book Request to retrieve all books
 *
 * @apiDescription Request to get all entries of all books
 *
 * @apiName GetAllBooks
 * @apiGroup Book
 *
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "isbn: {<code>isbn</code>}
 * author: [<code>author</code>]
 * publish year: [<code>publication</code>]
 * original title: [<code>original_title</code>]
 * title: [<code>title</code>]
 * average rating: [<code>average</code>]
 * total ratings: [<code>count</code>]
 * 1 star ratings: [<code>rating_1</code>]
 * 2 star ratings: [<code>rating_2</code>]
 * 3 star ratings: [<code>rating_3</code>]
 * 4 star ratings: [<code>rating_4</code>]
 * 5 star ratings: [<code>rating_5</code>]
 * cover (large): [<code>large</code>]
 * cover (small): [<code>small</code>]"
 *
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
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "isbn: {<code>isbn</code>}
 * author: [<code>author</code>]
 * publish year: [<code>publication</code>]
 * original title: [<code>original_title</code>]
 * title: [<code>title</code>]
 * average rating: [<code>average</code>]
 * total ratings: [<code>count</code>]
 * 1 star ratings: [<code>rating_1</code>]
 * 2 star ratings: [<code>rating_2</code>]
 * 3 star ratings: [<code>rating_3</code>]
 * 4 star ratings: [<code>rating_4</code>]
 * 5 star ratings: [<code>rating_5</code>]
 * cover (large): [<code>large</code>]
 * cover (small): [<code>small</code>]"
 *
 * @apiError (404: no books found) {String} message "No books with this <code>author</code> were found"
 */
bookRouter.get('/:author', (request: Request, response: Response) => {
    const theQuery = 'SELECT name, message, priority FROM Books WHERE = $1';
    const author = request.query.author;
});

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
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "isbn: {<code>isbn</code>}
 * author: [<code>author</code>]
 * publish year: [<code>publication</code>]
 * original title: [<code>original_title</code>]
 * title: [<code>title</code>]
 * average rating: [<code>average</code>]
 * total ratings: [<code>count</code>]
 * 1 star ratings: [<code>rating_1</code>]
 * 2 star ratings: [<code>rating_2</code>]
 * 3 star ratings: [<code>rating_3</code>]
 * 4 star ratings: [<code>rating_4</code>]
 * 5 star ratings: [<code>rating_5</code>]
 * cover (large): [<code>large</code>]
 * cover (small): [<code>small</code>]"
 *
 */

/**
 * @api {delete} /book Request to remove books by author
 *
 * @apiDescription Request to remove all books with the specified <code>author</code>
 *
 * @apiName DeleteBooksAuthor
 * @apiGroup Book
 *
 * @apiQuery {String} author The author's name
 *
 * @apiError (400: Author does not exist) {String} message "Author does not exist."
 */

//Ryley methods start here #########################################

/**
 * @api {get} /book Request for an author's book
 *
 * @apiDescription Request for the specified book title by the specified author
 *
 * @apiName GetBooksAuthorTitle
 * @apiGroup Book
 *
 * @apiQuery {String} author The author's name
 * @apiQuery {String} title The title of the book
 *
 * @apiSuccess {String[]} entry Specified entry with the form: (see above format)
 *
 * @apiError (400: Author does not exist) {String} message "Author does not exist."
 * @apiError (400: Book does not exist) {String} message "Book title does not exist."
 * @apiError (400: Book and Author do not match) {String} message "Book not written by specified author.
 */
// bookRouter.get(, () => {

// })

/**
 * @api {get} /book Request for books in a range of ratings.
 *
 * @apiDescription Request for all books with an average rating between the min and max values, inclusive.
 *
 * @apiName getAvgRatingRange
 * @apiGroup Book
 *
 * @apiQuery {int} min The minimum average rating to select
 * @apiQuery {int} max The maximum average rating to select
 *
 * @apiSuccess (Success 200) {String[]} entry Specified entry with the form: (COPY ABOVE FORMAT)
 *
 * @apiError (400: Minimum out of range) {String} message "Minimum rating is less than 0"
 * @apiError (400: Maximum out of range) {String} message "Maximum rating is greater than 5"
 */

/**
 * @api {post} /book Request to add a book.
 *
 *  @apiDescription Request to add a book with author name, isbn, publication year, and book title.
 *
 * @apiName putBook
 * @apiGroup Book
 *
 * @apiBody {String} author Author's name
 * @apiBody {int} isbn ISBN13 of the book
 * @apiBody {int} publication Year of publication
 * @apiBody {String} title Book title
 *
 * @apiSuccess (Success 201) {String} entry The String: "isbn: {<code>isbn</code>} - author: [<code>author</code>] - publish year: [<code>publication</code>] - title: [<code>title</code>]"
 */

export { bookRouter };
