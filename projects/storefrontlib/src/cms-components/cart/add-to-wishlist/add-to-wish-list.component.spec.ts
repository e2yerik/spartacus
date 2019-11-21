import { Component, DebugElement, Input, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  AuthService,
  Cart,
  I18nTestingModule,
  OrderEntry,
  Product,
  WishListService,
} from '@spartacus/core';
import { BehaviorSubject, of } from 'rxjs';
import { CurrentProductService } from '../../product/current-product.service';
import { AddToWishListComponent } from './add-to-wish-list.component';
import createSpy = jasmine.createSpy;

const mockProduct: Product = {
  code: 'xxx',
  name: 'product',
  summary: 'summary',
  stock: {
    stockLevel: 420,
    stockLevelStatus: 'Available',
  },
};

const mockCartEntry: OrderEntry = {
  entryNumber: 0,
  product: { code: 'xxx' },
  quantity: 1,
};

const mockCartEntry1: OrderEntry = {
  product: { code: 'yyy' },
};

const mockCartEntry2: OrderEntry = {
  product: { code: 'zzz' },
};

const entries = [mockCartEntry, mockCartEntry1, mockCartEntry2];

const mockEmptyWishList: Cart = {
  code: '1',
  entries: [],
};

const mockWishList: Cart = {
  code: '2',
  entries: entries,
};

class MockAuthService {
  isUserLoggedIn = createSpy().and.returnValue(of(true));
}

const wishListSubject = new BehaviorSubject(mockWishList);

class MockWishListService {
  addEntry = createSpy();
  removeEntry = createSpy();
  getWishList = createSpy().and.returnValue(wishListSubject);
  getWishListLoading = createSpy().and.returnValue(of(false));
}

class MockCurrentProductService {
  getProduct = createSpy().and.returnValue(of(mockProduct));
}

@Component({
  selector: 'cx-icon',
  template: '',
})
class MockIconComponent {
  @Input() type;
}

describe('AddToWishListComponent', () => {
  let component: AddToWishListComponent;
  let fixture: ComponentFixture<AddToWishListComponent>;
  let wishListService: WishListService;
  let el: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [AddToWishListComponent, MockIconComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: WishListService, useClass: MockWishListService },
        { provide: CurrentProductService, useClass: MockCurrentProductService },
      ],
    }).compileComponents();

    wishListService = TestBed.get(WishListService as Type<WishListService>);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToWishListComponent);
    component = fixture.componentInstance;

    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('add', () => {
    it('should add product to wish list', () => {
      component.add(mockProduct);

      expect(wishListService.addEntry).toHaveBeenCalledWith(mockProduct.code);
    });
  });

  describe('remove', () => {
    it('should remove product from wish list', () => {
      component.remove(mockCartEntry);

      expect(wishListService.removeEntry).toHaveBeenCalledWith(mockCartEntry);
    });
  });

  describe('getProductInWishList', () => {
    it('should return entry if product is in the wish list', () => {
      const result = component.getProductInWishList(mockProduct, entries);

      expect(result).toEqual(mockCartEntry);
    });
    it('should return "undefined" if product is NOT in the wish list', () => {
      const result = component.getProductInWishList(
        { code: 'not_in_wish_list' },
        entries
      );

      expect(result).toBe(undefined);
    });
  });

  describe('setStockInfo', () => {
    it('should set "hasStock" to true', () => {
      component['setStockInfo'](mockProduct);

      expect(component.hasStock).toBeTruthy();
    });
    it('should set "hasStock" to false', () => {
      component['setStockInfo']({ code: '123' });

      expect(component.hasStock).toBeFalsy();
    });
  });

  describe('UI', () => {
    it('should show remove from wish list if product is the in wish list', () => {
      fixture.detectChanges();
      expect(el.query(By.css('.button-remove')).nativeElement).toBeDefined();
    });

    it('should show add to wish list if product is NOT the in wish list', () => {
      wishListSubject.next(mockEmptyWishList);
      fixture.detectChanges();
      expect(el.query(By.css('.button-add')).nativeElement).toBeDefined();
    });
  });
});
